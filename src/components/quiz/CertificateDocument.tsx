import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Certificate } from '../../types';
import { LogoMark } from '../brand/Logo';

const certificateFont = 'Arial, Helvetica, sans-serif';

function formatIssuedDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function CertificateQr({ value }: { value: string }) {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    let active = true;
    QRCode.toString(value, {
      type: 'svg',
      margin: 1,
      width: 128,
      color: { dark: '#102033', light: '#ffffff' },
    }).then((markup: string) => {
      const fitted = markup
        .replace(/width="[^"]*"/, 'width="100%"')
        .replace(/height="[^"]*"/, 'height="100%"');
      if (active) setSvg(fitted);
    }).catch(() => {
      if (active) setSvg('');
    });
    return () => {
      active = false;
    };
  }, [value]);

  return (
    <div
      className="mx-auto h-16 w-16 overflow-hidden bg-white [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
      aria-hidden={svg ? undefined : true}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export const CertificateDocument: React.FC<{ certificate: Certificate }> = ({ certificate }) => {
  const percentage = certificate.totalQuestions
    ? Math.round((certificate.score / certificate.totalQuestions) * 100)
    : 0;

  return (
    <article
      className="certificate-sheet relative w-[1000px] max-w-none overflow-hidden rounded-2xl bg-[#07182c] p-4 text-[#102033] shadow-sm sm:p-5"
      style={{ fontFamily: certificateFont }}
    >
      <div className="pointer-events-none absolute -left-16 top-8 h-72 w-72 rounded-full border border-[#1f8a4c]/40" />
      <div className="pointer-events-none absolute -bottom-24 -right-10 h-80 w-80 rounded-full bg-[#145c3a]" />
      <div className="relative rounded-[28px] border border-[#d4af37]/80 bg-[#07182c] px-6 pb-6 pt-5 sm:px-8">
        <header className="flex items-center justify-between gap-6 text-white">
          <div className="flex items-center gap-3">
            <LogoMark className="h-12 w-12" />
            <div>
              <p className="text-2xl font-bold tracking-tight">
                <span className="text-white">Quiz</span><span className="text-[#7dcea0]">Master</span>
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d4af37]">Learn · Practice · Improve</p>
            </div>
          </div>
          <p className="max-w-[180px] text-right text-[10px] font-bold uppercase leading-4 tracking-[0.18em] text-[#d4af37]">
            Official record of a perfect score
          </p>
        </header>

        <div className="relative mt-4 rounded-[32px] bg-[#f7f4ec] px-10 pb-8 pt-8">
          <div className="absolute right-8 top-6 z-10">
            <svg viewBox="0 0 170 250" className="h-52 w-36" aria-hidden="true">
              <path d="M24 108 h122 v108 l-61 26 l-61-26 z" fill="#0d3f73" />
              <path d="M34 108 h102 v96 l-51 20 l-51-20 z" fill="#163e66" />
              <circle cx="85" cy="74" r="52" fill="#e2c56a" />
              <circle cx="85" cy="74" r="44" fill="none" stroke="#8d6b24" strokeWidth="2" />
              <path d="M58 74 L85 58 L112 74 L85 90 Z" fill="#102033" />
              <path d="M70 78 v10 c0 6 7 10 15 10 s15-4 15-10 v-10" fill="none" stroke="#102033" strokeWidth="2.4" />
              <text x="85" y="168" textAnchor="middle" fill="#f7f4ec" fontSize="15" fontFamily={certificateFont} fontWeight="700">QUIZ</text>
              <text x="85" y="186" textAnchor="middle" fill="#f7f4ec" fontSize="11" fontFamily={certificateFont} fontWeight="700">COMPLETED</text>
            </svg>
          </div>

          <div className="text-center">
            <h1 className="-mr-[0.12em] text-5xl font-bold tracking-[0.12em] text-[#b68b2d]">CERTIFICATE</h1>
            <p className="-mr-[0.42em] mt-2 text-sm font-bold tracking-[0.42em] text-[#8d6b24]">OF ACHIEVEMENT</p>
            <div className="mx-auto mt-3 h-px w-40 bg-[#d4af37]" />
            <p className="mt-6 text-sm text-slate-600">This is to certify that</p>
            <p className="mt-3 text-5xl font-bold leading-tight text-[#1f6b4a]">{certificate.recipientName}</p>
            <p className="mt-5 text-sm text-slate-600">has successfully completed the quiz</p>
            <p className="mt-1 text-3xl font-bold text-[#102033]">{certificate.topic}</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
              This certificate records a perfect score on the saved answer key, awarded for demonstrated command of the topic.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-3 text-left">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M8 20 h8 M9 16 h6 l1 4 H8 z M12 4 l2 4 h4 l-3 3 1 4-4-2-4 2 1-4-3-3 h4 z" />
                </svg>
              </span>
              <span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Score</span>
                <span className="block text-lg font-bold text-[#102033]">{percentage}%</span>
              </span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 items-end border-t border-[#e4d7b4] pt-6">
            <div className="text-left">
              <p className="text-lg font-bold text-[#102033]">{formatIssuedDate(certificate.issuedAt)}</p>
              <p className="-mr-[0.16em] mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Date of completion</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold leading-none text-[#1c2a44]">QuizMaster</p>
              <div className="mx-auto mt-2 h-px w-36 bg-slate-300" />
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">QuizMaster learning platform</p>
            </div>
            <div className="w-36 justify-self-end text-center">
              <CertificateQr value={certificate.certificateNumber} />
              <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Verify</p>
              <p className="mt-1 whitespace-nowrap text-[11px] font-bold leading-none text-[#102033]">{certificate.certificateNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
