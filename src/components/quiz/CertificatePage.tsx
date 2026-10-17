import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Button } from '../ui/Button';
import { CertificateDocument } from './CertificateDocument';
import { quizService } from '../../services/quizService';
import { Certificate } from '../../types';
import { ArrowLeft, Download } from 'lucide-react';

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not prepare the certificate'));
    image.src = src;
  });
}

export const CertificatePage: React.FC = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [sheetScale, setSheetScale] = useState({ scale: 1, height: 0 });
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!certificateId) return;
    let active = true;
    quizService.getCertificate(certificateId)
      .then((item) => {
        if (active) setCertificate(item);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Certificate not found');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [certificateId]);

  useLayoutEffect(() => {
    const frame = sheetRef.current;
    if (!frame) return;
    const update = () => {
      const sheet = frame.querySelector('.certificate-sheet');
      if (!(sheet instanceof HTMLElement)) return;
      const scale = Math.min(1, frame.clientWidth / sheet.offsetWidth);
      setSheetScale({ scale, height: sheet.offsetHeight * scale });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [certificate]);

  const downloadCertificate = async () => {
    const node = sheetRef.current?.querySelector('.certificate-sheet');
    if (!(node instanceof HTMLElement) || !certificate) return;
    setDownloading(true);
    setDownloadError('');
    try {
      const dataUrl = await toJpeg(node, {
        pixelRatio: 2,
        quality: 0.92,
        cacheBust: true,
        backgroundColor: '#07182c',
      });
      const image = await loadImage(dataUrl);
      const pageWidth = 297;
      const pageHeight = 210;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      pdf.setFillColor(7, 24, 44);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      const imageRatio = image.width / image.height;
      const pageRatio = pageWidth / pageHeight;
      const width = imageRatio > pageRatio ? pageWidth : pageHeight * imageRatio;
      const height = imageRatio > pageRatio ? pageWidth / imageRatio : pageHeight;
      pdf.addImage(dataUrl, 'JPEG', (pageWidth - width) / 2, (pageHeight - height) / 2, width, height);
      pdf.save(`QuizMaster-Certificate-${certificate.certificateNumber}.pdf`);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Could not download the certificate');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="mx-auto h-64 max-w-3xl animate-pulse rounded-2xl bg-slate-200 dark:bg-zinc-800" />;
  }

  if (error || !certificate) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="mb-4 text-slate-600 dark:text-zinc-300">{error || 'Certificate not found'}</p>
        <Button onClick={() => navigate('/user-dashboard')}>Back to dashboard</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="no-print mx-auto mb-6 flex max-w-[1100px] flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/user-dashboard')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>
        <div className="flex flex-col items-end gap-2">
          <Button type="button" onClick={downloadCertificate} loading={downloading}>
            {!downloading && <Download className="h-4 w-4" />}
            Download Certificate
          </Button>
          {downloadError && <p className="text-sm text-red-600">{downloadError}</p>}
        </div>
      </div>
      <div ref={sheetRef} className="w-full overflow-hidden">
        <div style={{ height: sheetScale.height || undefined }}>
          <div className="origin-top-left" style={{ transform: `scale(${sheetScale.scale})` }}>
            <CertificateDocument certificate={certificate} />
          </div>
        </div>
      </div>
    </div>
  );
};
