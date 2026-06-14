import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, classroomsTable, questionsTable } from "@workspace/db";
import {
  CreateClassBody,
  GetClassByCodeParams,
  GetClassByCodeResponse,
  CloseClassParams,
  CloseClassResponse,
  GetClassSummaryParams,
  GetClassSummaryResponse,
  ListQuestionsParams,
  ListQuestionsResponse,
  SubmitQuestionParams,
  SubmitQuestionBody,
  UpdateQuestionParams,
  UpdateQuestionBody,
  UpdateQuestionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

router.post("/classes", async (req, res): Promise<void> => {
  const parsed = CreateClassBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let code = generateCode();
  let attempts = 0;
  while (attempts < 10) {
    const existing = await db
      .select()
      .from(classroomsTable)
      .where(eq(classroomsTable.code, code));
    if (existing.length === 0) break;
    code = generateCode();
    attempts++;
  }

  const [classroom] = await db
    .insert(classroomsTable)
    .values({
      name: parsed.data.name,
      teacherName: parsed.data.teacherName,
      code,
      isActive: true,
    })
    .returning();

  res.status(201).json({
    ...classroom,
    createdAt: classroom.createdAt.toISOString(),
  });
});

router.get("/classes/:code", async (req, res): Promise<void> => {
  const params = GetClassByCodeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [classroom] = await db
    .select()
    .from(classroomsTable)
    .where(eq(classroomsTable.code, params.data.code.toUpperCase()));

  if (!classroom) {
    res.status(404).json({ error: "Classroom not found" });
    return;
  }

  res.json(GetClassByCodeResponse.parse({
    ...classroom,
    createdAt: classroom.createdAt.toISOString(),
  }));
});

router.patch("/classes/:classId/close", async (req, res): Promise<void> => {
  const params = CloseClassParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [classroom] = await db
    .update(classroomsTable)
    .set({ isActive: false })
    .where(eq(classroomsTable.id, params.data.classId))
    .returning();

  if (!classroom) {
    res.status(404).json({ error: "Classroom not found" });
    return;
  }

  res.json(CloseClassResponse.parse({
    ...classroom,
    createdAt: classroom.createdAt.toISOString(),
  }));
});

router.get("/classes/:classId/summary", async (req, res): Promise<void> => {
  const params = GetClassSummaryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [classroom] = await db
    .select()
    .from(classroomsTable)
    .where(eq(classroomsTable.id, params.data.classId));

  if (!classroom) {
    res.status(404).json({ error: "Classroom not found" });
    return;
  }

  const allQuestions = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.classId, params.data.classId));

  const totalQuestions = allQuestions.length;
  const answeredQuestions = allQuestions.filter((q) => q.isAnswered).length;
  const unansweredQuestions = totalQuestions - answeredQuestions;

  res.json(GetClassSummaryResponse.parse({
    classId: params.data.classId,
    totalQuestions,
    answeredQuestions,
    unansweredQuestions,
  }));
});

router.get("/classes/:classId/questions", async (req, res): Promise<void> => {
  const params = ListQuestionsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const questions = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.classId, params.data.classId))
    .orderBy(questionsTable.createdAt);

  res.json(ListQuestionsResponse.parse(
    questions.map((q) => ({ ...q, createdAt: q.createdAt.toISOString() }))
  ));
});

router.post("/classes/:classId/questions", async (req, res): Promise<void> => {
  const params = SubmitQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = SubmitQuestionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [classroom] = await db
    .select()
    .from(classroomsTable)
    .where(eq(classroomsTable.id, params.data.classId));

  if (!classroom) {
    res.status(404).json({ error: "Classroom not found" });
    return;
  }

  const [question] = await db
    .insert(questionsTable)
    .values({
      classId: params.data.classId,
      text: body.data.text,
      isAnswered: false,
    })
    .returning();

  res.status(201).json({
    ...question,
    createdAt: question.createdAt.toISOString(),
  });
});

router.patch("/classes/:classId/questions/:questionId", async (req, res): Promise<void> => {
  const params = UpdateQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateQuestionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updateData: Partial<{ isAnswered: boolean }> = {};
  if (body.data.isAnswered !== undefined) {
    updateData.isAnswered = body.data.isAnswered;
  }

  const [question] = await db
    .update(questionsTable)
    .set(updateData)
    .where(eq(questionsTable.id, params.data.questionId))
    .returning();

  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  res.json(UpdateQuestionResponse.parse({
    ...question,
    createdAt: question.createdAt.toISOString(),
  }));
});

export default router;
