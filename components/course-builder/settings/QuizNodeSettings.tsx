"use client";

import React, { useState, useEffect } from 'react';
import { type Node } from '@xyflow/react';
import { PenLine, Sparkles, Plus, Trash2, X, ListChecks, CircleDot, CheckSquare } from 'lucide-react';
import { dict } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/Button';

// ---------- types ----------
type Tab = 'manual' | 'ai';

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  type: 'single' | 'multiple';
  options: QuizOption[];
  correctAnswers: string[];
  points: number;
}

interface QuizNodeSettingsProps {
  node: Node;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
}

const tabs: { key: Tab; icon: React.ElementType; labelKey: 'tab_manual_quiz' | 'tab_ai_quiz' }[] = [
  { key: 'manual', icon: PenLine,  labelKey: 'tab_manual_quiz' },
  { key: 'ai',     icon: Sparkles, labelKey: 'tab_ai_quiz' },
];

// ---------- helpers ----------
let idCounter = 0;
const uid = () => `q_${Date.now()}_${++idCounter}`;

const createEmptyOption = (): QuizOption => ({ id: uid(), text: '' });

const createEmptyQuestion = (): QuizQuestion => ({
  id: uid(),
  text: '',
  type: 'single',
  options: [createEmptyOption(), createEmptyOption()],
  correctAnswers: [],
  points: 1,
});

// ---------- QuestionCard sub-component ----------
const QuestionCard: React.FC<{
  question: QuizQuestion;
  index: number;
  onChange: (updated: QuizQuestion) => void;
  onRemove: () => void;
}> = ({ question, index, onChange, onRemove }) => {
  const t = dict.uk.course_builder;

  const updateText = (text: string) => onChange({ ...question, text });
  const updateType = (type: 'single' | 'multiple') => {
    onChange({ ...question, type, correctAnswers: [] });
  };
  const updatePoints = (pts: number) => onChange({ ...question, points: Math.max(1, pts) });

  const updateOptionText = (optId: string, text: string) => {
    onChange({ ...question, options: question.options.map((o) => (o.id === optId ? { ...o, text } : o)) });
  };

  const addOption = () => {
    onChange({ ...question, options: [...question.options, createEmptyOption()] });
  };

  const removeOption = (optId: string) => {
    if (question.options.length <= 2) return;
    onChange({
      ...question,
      options: question.options.filter((o) => o.id !== optId),
      correctAnswers: question.correctAnswers.filter((id) => id !== optId),
    });
  };

  const toggleCorrect = (optId: string) => {
    if (question.type === 'single') {
      onChange({ ...question, correctAnswers: [optId] });
    } else {
      const has = question.correctAnswers.includes(optId);
      onChange({
        ...question,
        correctAnswers: has
          ? question.correctAnswers.filter((id) => id !== optId)
          : [...question.correctAnswers, optId],
      });
    }
  };

  return (
    <div className="rounded-lg border border-border/40 bg-muted/5 p-3 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Q{index + 1}
        </span>
        <button onClick={onRemove} className="w-5 h-5 rounded flex items-center justify-center hover:bg-destructive/10 transition-colors">
          <Trash2 size={11} className="text-muted-foreground hover:text-destructive" />
        </button>
      </div>

      {/* Question text */}
      <input
        type="text"
        value={question.text}
        onChange={(e) => updateText(e.target.value)}
        placeholder={t.question_placeholder}
        className="w-full px-2.5 py-1.5 text-sm rounded-md border border-border/50 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
      />

      {/* Type + Points row */}
      <div className="flex items-center gap-2">
        <select
          value={question.type}
          onChange={(e) => updateType(e.target.value as 'single' | 'multiple')}
          className="flex-1 px-2 py-1 text-[11px] rounded-md border border-border/50 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
        >
          <option value="single">{t.type_single}</option>
          <option value="multiple">{t.type_multiple}</option>
        </select>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            value={question.points}
            onChange={(e) => updatePoints(parseInt(e.target.value) || 1)}
            className="w-12 px-1.5 py-1 text-[11px] text-center rounded-md border border-border/50 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          <span className="text-[10px] text-muted-foreground">{t.points}</span>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-1.5">
        {question.options.map((opt) => {
          const isCorrect = question.correctAnswers.includes(opt.id);
          return (
            <div key={opt.id} className="flex items-center gap-1.5">
              {/* Correct toggle */}
              <button
                onClick={() => toggleCorrect(opt.id)}
                className={`shrink-0 w-4 h-4 rounded-${question.type === 'single' ? 'full' : 'sm'} border flex items-center justify-center transition-colors ${
                  isCorrect
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'border-border/60 hover:border-primary/40'
                }`}
              >
                {isCorrect && (question.type === 'single' ? <CircleDot size={8} /> : <CheckSquare size={8} />)}
              </button>
              {/* Option text */}
              <input
                type="text"
                value={opt.text}
                onChange={(e) => updateOptionText(opt.id, e.target.value)}
                placeholder={t.option_placeholder}
                className="flex-1 px-2 py-1 text-[12px] rounded-md border border-border/40 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
              />
              {/* Remove option */}
              {question.options.length > 2 && (
                <button
                  onClick={() => removeOption(opt.id)}
                  className="shrink-0 w-4 h-4 rounded flex items-center justify-center hover:bg-destructive/10 transition-colors"
                >
                  <X size={8} className="text-muted-foreground hover:text-destructive" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add option */}
      <button
        onClick={addOption}
        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus size={10} />
        {t.add_option}
      </button>
    </div>
  );
};

// ---------- main component ----------
export const QuizNodeSettings: React.FC<QuizNodeSettingsProps> = ({ node, updateNodeData }) => {
  const t = dict.uk.course_builder;
  const [activeTab, setActiveTab] = useState<Tab>('manual');

  // Safe derive
  const raw = node.data.questions as QuizQuestion[] | undefined;
  const questions: QuizQuestion[] = raw && Array.isArray(raw) ? raw : [];

  // Auto-init not needed for quiz — starts empty, user adds questions

  const updateQuestions = (updated: QuizQuestion[]) => {
    updateNodeData(node.id, { questions: updated });
  };

  const addQuestion = () => updateQuestions([...questions, createEmptyQuestion()]);

  const updateQuestion = (idx: number, q: QuizQuestion) => {
    updateQuestions(questions.map((existing, i) => (i === idx ? q : existing)));
  };

  const removeQuestion = (idx: number) => {
    updateQuestions(questions.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      {/* Segmented tab bar */}
      <div className="flex rounded-lg border border-border/50 bg-muted/30 p-0.5">
        {tabs.map(({ key, icon: Icon, labelKey }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 ${
              activeTab === key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={12} />
            {t[labelKey]}
          </button>
        ))}
      </div>

      {/* ============ MANUAL TAB ============ */}
      {activeTab === 'manual' && (
        <div className="space-y-3">
          {/* Question cards */}
          {questions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={idx}
              onChange={(updated) => updateQuestion(idx, updated)}
              onRemove={() => removeQuestion(idx)}
            />
          ))}

          {/* Empty state hint */}
          {questions.length === 0 && (
            <div className="flex flex-col items-center py-6 gap-2 text-center">
              <ListChecks size={20} className="text-muted-foreground/50" />
              <p className="text-[11px] text-muted-foreground">
                {t.question_placeholder}
              </p>
            </div>
          )}

          {/* Add question button */}
          <Button variant="minimal" className="w-full border-[0.5px] border-foreground/20 gap-1.5 text-[11px]" onClick={addQuestion}>
            <Plus size={12} />
            {t.add_question}
          </Button>
        </div>
      )}

      {/* ============ AI TAB ============ */}
      {activeTab === 'ai' && (
        <div className="flex flex-col items-center justify-center py-8 gap-4 rounded-lg border border-dashed border-border/50 bg-muted/10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-500/15 flex items-center justify-center">
            <Sparkles size={22} className="text-violet-400" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-xs text-muted-foreground leading-snug max-w-[200px]">
              {t.ai_quiz_desc}
            </p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-400 border border-violet-500/30">
              ✦ {t.badge_premium}
            </span>
          </div>
          <Button
            variant="minimal"
            className="border-[0.5px] border-violet-500/30 text-violet-400 hover:bg-violet-500/10 gap-1.5 text-[11px]"
            onClick={() => console.log('[AI Quiz] Generate quiz for node:', node.id)}
          >
            <Sparkles size={12} />
            {t.btn_generate_quiz}
          </Button>
        </div>
      )}
    </div>
  );
};
