#!/bin/bash
git remote set-url origin https://github.com/Nicko-Reorizo/SpeakUp.git 2>/dev/null || git remote add origin https://github.com/Nicko-Reorizo/SpeakUp.git
git push -u origin main --force
