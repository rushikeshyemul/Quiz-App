import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { quizService } from '../../services/quizService';
import { FileText, AlertCircle, ArrowLeft } from 'lucide-react';

export const PDFUpload: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [material, setMaterial] = useState<{ id: string; filename: string; preview: string; charCount: number; pageCount: number } | null>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [busy, setBusy] = useState<'upload' | 'generate' | null>(null);
  const [error, setError] = useState('');

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    setMaterial(null);
    setError('');
    if (!selected) {
      setFile(null);
      return;
    }
    const allowed = selected.type === 'application/pdf' || selected.type === 'text/plain' || /\.(pdf|txt)$/i.test(selected.name);
    if (!allowed) {
      setFile(null);
      setError('Choose a PDF or plain text file.');
      return;
    }
    if (selected.size > 8 * 1024 * 1024) {
      setFile(null);
      setError('File must be 8 MB or smaller.');
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setBusy('upload');
    setError('');
    try {
      setMaterial(await quizService.uploadStudyMaterial(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that document');
    } finally {
      setBusy(null);
    }
  };

  const handleGenerate = async () => {
    if (!material) return;
    setBusy('generate');
    setError('');
    try {
      const quiz = await quizService.generateQuizFromMaterial(material.id, {
        questionCount,
        difficulty,
        timeLimit: 15,
      });
      navigate('/quiz', {
        state: {
          quiz,
          config: {
            topic: quiz.topic,
            questionCount: quiz.questions.length,
            timeLimit: quiz.timeLimit,
            difficulty,
          },
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate a quiz from this document');
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </button>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Source-grounded quiz</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">Study material</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
          Upload notes as PDF or text. Questions are written from the extracted text. Scanned pages are rejected because OCR is not available.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="space-y-5">
          <label className="block rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-white/15">
            <input type="file" accept=".pdf,.txt,application/pdf,text/plain" onChange={handleFile} className="hidden" />
            <FileText className="mx-auto mb-3 h-8 w-8 text-slate-400" />
            <p className="text-sm font-medium text-slate-800 dark:text-zinc-100">{file ? file.name : 'Choose a PDF or text file'}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Maximum 8 MB. The original file is not kept after text is extracted.</p>
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {material && (
            <div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-zinc-950">
              <p className="font-medium text-slate-900 dark:text-zinc-50">{material.filename}</p>
              <p className="mt-1 text-slate-500 dark:text-zinc-400">{material.charCount} characters · {material.pageCount} page{material.pageCount === 1 ? '' : 's'}</p>
              <p className="mt-3 whitespace-pre-wrap text-slate-700 dark:text-zinc-300">{material.preview}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">
              Questions
              <select
                value={questionCount}
                onChange={(event) => setQuestionCount(Number(event.target.value))}
                className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">
              Difficulty
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as 'easy' | 'medium' | 'hard')}
                className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleUpload} disabled={!file || busy !== null} loading={busy === 'upload'} className="flex-1">
              Extract text
            </Button>
            <Button type="button" onClick={handleGenerate} disabled={!material || busy !== null} loading={busy === 'generate'} className="flex-1">
              Generate quiz
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
