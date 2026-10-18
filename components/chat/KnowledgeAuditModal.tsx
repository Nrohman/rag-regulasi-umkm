"use client";

import React from "react";
import { useChatStore } from "@/lib/store/useChatStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Scale, ExternalLink, ShieldCheck, BookOpen, CheckCircle2 } from "lucide-react";

export default function KnowledgeAuditModal() {
  const { isAuditModalOpen, closeAuditModal, activeCitation } = useChatStore();

  if (!activeCitation) return null;

  return (
    <Dialog open={isAuditModalOpen} onOpenChange={(open) => !open && closeAuditModal()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
        <DialogHeader className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Scale className="w-4 h-4" />
            <span>Audit Pengetahuan Hukum (Knowledge Audit)</span>
          </div>

          <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50 leading-snug">
            {activeCitation.title}
          </DialogTitle>

          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 pt-1">
            <span className="px-2 py-0.5 rounded-md font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {activeCitation.pasal}
            </span>
            <span className="px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Kategori: {activeCitation.category}
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Status: AKTIF</span>
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Content Body: Raw Law Text */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Bunyi Naskah Asli Peraturan:</span>
            </label>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed select-text shadow-inner">
              {activeCitation.content_raw}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-800 dark:text-amber-300 leading-normal">
            ℹ️ <strong>Catatan Integritas:</strong> Teks di atas merupakan cuplikan mentah (*raw chunk*) dari lembaran negara resmi tanpa rekayasa AI untuk memastikan transparansi dan validitas hukum.
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          {activeCitation.source_url ? (
            <a
              href={activeCitation.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Buka Dokumen Resmi Pemerintah</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-xs text-slate-400">Sumber: Dokumen Terverifikasi</span>
          )}

          <button
            onClick={closeAuditModal}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Tutup
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
