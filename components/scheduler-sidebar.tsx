import { SectionCard } from "@/components/section-card";
import type { DragPayload, Lesson } from "@/lib/types";

export function SchedulerSidebar({
  sidebarOpen,
  filteredSections,
  activePayload,
  query,
  statusFilter,
  selectedSectionId,
  lessons,
  lookups,
  onToggleSidebar,
  onQueryChange,
  onStatusChange,
  onRemoveLesson,
  onSelectSection,
  onDragStart,
}: {
  sidebarOpen: boolean;
  filteredSections: Array<{
    id: string;
    code: string;
    courseId: string;
    teacherId: string | null;
    requiredLessonsPerWeek: number;
    studentsCount: number;
  }>;
  activePayload: DragPayload | null;
  query: string;
  statusFilter: "all" | "open" | "done";
  selectedSectionId: string | null;
  lessons: Lesson[];
  lookups: ReturnType<typeof import("@/lib/schedule").createLookups>;
  onToggleSidebar: () => void;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: "all" | "open" | "done") => void;
  onRemoveLesson: (event: React.DragEvent) => void;
  onSelectSection: (sectionId: string) => void;
  onDragStart: (event: React.DragEvent, payload: DragPayload) => void;
}) {
  return (
    <aside
      className={`flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-300 ease-out ${
        sidebarOpen ? "max-h-[760px] xl:max-h-none" : "max-h-[76px] xl:max-h-none"
      }`}
    >
      <div
        className={`flex gap-2 border-b border-slate-200 p-3 ${
          sidebarOpen ? "items-center justify-between" : "items-center justify-between xl:flex-col xl:border-b-0"
        }`}
      >
        {sidebarOpen ? (
          <div>
            <h2 className="font-semibold">Секции</h2>
            <p className="text-xs text-slate-500">Перетащите секцию в свободный слот</p>
          </div>
        ) : (
          <div className="min-w-0 xl:text-center">
            <div className="text-xs font-medium text-slate-500 xl:hidden">Секции</div>
            <div className="hidden rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 xl:block">
              {filteredSections.length}
            </div>
          </div>
        )}
        <button
          className="h-8 min-w-8 rounded-md border border-slate-300 bg-white px-2 text-sm font-medium hover:bg-slate-50"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Свернуть список секций" : "Открыть список секций"}
          title={sidebarOpen ? "Свернуть список секций" : "Открыть список секций"}
        >
          {sidebarOpen ? "←" : "☰"}
        </button>
      </div>

      <div className={sidebarOpen ? "contents" : "hidden"}>
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white p-3">
          <div className="mb-3 rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            <b className="font-semibold text-slate-800">Как работать:</b> перетащите секцию в
            ячейку расписания или нажмите “Поставить” и затем выберите слот кликом. Зеленый слот
            доступен, красный показывает причину конфликта.
          </div>
          <div
            className={`mb-3 rounded-lg border border-dashed p-3 text-center text-sm transition-colors ${
              activePayload?.type === "lesson"
                ? "border-rose-300 bg-rose-50 text-rose-700"
                : "border-slate-300 bg-white text-slate-500"
            }`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={onRemoveLesson}
          >
            {activePayload?.type === "lesson"
              ? "Отпустите здесь, чтобы снять занятие"
              : "Сюда можно перетащить занятие для удаления из расписания"}
          </div>
          <input
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-700"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Поиск по секции, курсу, преподавателю"
          />
          <div className="mt-3 grid grid-cols-3 rounded-md border border-slate-200 bg-slate-50 p-1 text-sm">
            {[
              ["all", "Все"],
              ["open", "Открытые"],
              ["done", "Готовые"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={`rounded px-2 py-1.5 ${
                  statusFilter === value ? "bg-white shadow-sm" : "text-slate-500"
                }`}
                onClick={() => onStatusChange(value as "all" | "open" | "done")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
          {filteredSections.map((section) => (
            <SectionCard
              key={section.id}
              section={section as any}
              lessons={lessons}
              lookups={lookups}
              selected={selectedSectionId === section.id}
              onDragStart={onDragStart}
              onSelect={onSelectSection}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
