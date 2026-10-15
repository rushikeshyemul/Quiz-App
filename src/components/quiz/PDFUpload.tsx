import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { quizService } from '../../services/quizService';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export const PDFUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError('');

    try {
      const quiz = await quizService.uploadPDFQuiz(file);
      
      // Save quiz to backend to get proper MongoDB _id
      const savedQuiz = await quizService.saveQuizToBackend({
        topic: quiz.topic,
        questions: quiz.questions,
        timeLimit: quiz.timeLimit,
      });
      
      navigate('/quiz', { 
        state: { 
          config: {
            topic: savedQuiz.topic,
            questionCount: savedQuiz.questions.length,
            timeLimit: savedQuiz.timeLimit,
            difficulty: 'medium' as const,
          },
          quiz: savedQuiz,
        }
      });
    } catch {
      setError('Failed to process PDF. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </button>
      <div className="mb-8 text-center">
        <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
          Upload PDF Quiz
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-400">
          Upload a PDF containing quiz questions and answers
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          {/* File Upload Area */}
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-white/15">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="cursor-pointer"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="mb-2 text-lg font-medium text-gray-700 dark:text-zinc-200">
                Click to select PDF file
              </p>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Or drag and drop your PDF here
              </p>
            </label>
          </div>

          {/* Selected File Info */}
          {file && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-500/30 dark:bg-green-500/10">
              <div className="flex items-center">
                <FileText className="w-6 h-6 text-green-600 mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-green-900 dark:text-green-300">{file.name}</p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
              <div className="flex items-center">
                <AlertCircle className="mr-3 h-6 w-6 text-red-600" />
                <p className="text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/10">
            <h3 className="mb-2 font-semibold text-blue-900 dark:text-indigo-200">PDF Requirements:</h3>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-indigo-200">
              <li>• File must be in PDF format</li>
              <li>• Maximum file size: 10MB</li>
              <li>• Questions should be clearly formatted</li>
              <li>• Include answer options (A, B, C, D)</li>
              <li>• Correct answers should be indicated</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              loading={uploading}
              className="flex-1"
              size="lg"
            >
              {uploading ? 'Processing PDF...' : 'Upload & Start Quiz'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};