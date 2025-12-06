"use client";
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const questions = [
    {
      q: "What key features should a Learning Management app have?",
      a: "It should include progress tracking, calendar integration, course enrollment, and analytics.",
    },
    {
      q: "How can I track my daily learning progress effectively?",
      a: "Use our built-in dashboard to see daily active minutes and modules completed.",
    },
    {
      q: "How do I update my LMS landing page content?",
      a: "Go to settings and update your profile preferences to change your feed.",
    },
    {
      q: "What should I include in the pricing section?",
      a: "Transparent tiers, features per plan, and any free trial information.",
    },
  ];

  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {questions.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(idx === openIndex ? -1 : idx)}
                className="w-full flex justify-between items-center p-6 text-left"
              >
                <span className="font-semibold text-slate-900">{item.q}</span>
                {openIndex === idx ? (
                  <ChevronUp className="text-indigo-600" />
                ) : (
                  <ChevronDown className="text-slate-400" />
                )}
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-6 text-slate-600 animate-fadeIn">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
