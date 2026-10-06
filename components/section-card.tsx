import { getSectionStatus, sectionProgress } from "@/lib/schedule";
import type { DragPayload, Lesson, Section } from "@/lib/types";

export function SectionCard({
  section,
  lessons,
  lookups,
  selected,
  onDragStart,
  onSelect,
}: {
  section: Section;
  lessons: Lesson[];
  lookups: ReturnType<typeof import("@/lib/schedule").createLookups>;
  selected: boolean;
  onDragStart: (event: React.DragEvent, payload: DragPayload) => void;
  onSelect: (sectionId: string) => void;
}) {
  const course = lookups.courses.get(section.courseId);
  const teacher = section.teacherId ? lookups.teachers.get(section.teacherId) : null;
  const planned = sectionProgress(section.id, lessons);
  const status = getSectionStatus(section, lessons);
  const progress = Math.min(100, (planned / section.requiredLessonsPerWeek) * 100);
  const left = Math.max(section.requiredLessonsPerWeek - planned, 0);
  const statusLabel = {
    empty: "Не распределено",
    partial: "Частично",
    done: "Готово",
  }[status];

  return (
    <article
      draggable
      onDragStart={(event) => onDragStart(event, { type: "section", sectionId: section.id })}
      className={`cursor-grab rounded-lg border bg-white p-3 shadow-sm active:cursor-grabbing ${
        selected ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{section.code}</h3>
          <p className="line-clamp-1 text-sm text-slate-600">{course?.name ?? "Курс"}</p>
        </div>
        <span className={`status ${status}`}>
          {planned}/{section.requiredLessonsPerWeek}
        </span>
      </div>
      <p className="mt-2 text-xs font-medium text-slate-500">
        {statusLabel}. Осталось поставить: {left}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-900" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded bg-slate-100 px-2 py-1">{section.studentsCount} студ.</span>
        <span className="rounded bg-slate-100 px-2 py-1">
          {section.requiredLessonsPerWeek} занятий/нед.
        </span>
        <span className="basis-full">
          Преподаватель: {teacher?.shortName ?? "не выбран, будет подобран автоматически"}
        </span>
      </div>
      <button
        className={`mt-3 h-8 w-full rounded-md border px-3 text-sm font-medium ${
          selected
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        }`}
        onClick={() => onSelect(section.id)}
        type="button"
      >
        {selected ? "Выбрана: кликните по слоту" : "Поставить без перетаскивания"}
      </button>
    </article>
  );
}
