import { slotKey } from "@/lib/schedule";
import type { DragPayload, Lesson, ValidationResult, WeekDay } from "@/lib/types";
import { LessonCard } from "@/components/lesson-card";

export function SlotRow(props: {
  dayLabels: Record<WeekDay, string>;
  days: WeekDay[];
  timeSlotId: string;
  timeLabel: string;
  activePayload: DragPayload | null;
  hoveredSlot: string | null;
  lessons: Lesson[];
  lookups: ReturnType<typeof import("@/lib/schedule").createLookups>;
  placementFor: (
    payload: DragPayload | null,
    day: WeekDay,
    timeSlotId: string,
  ) => ValidationResult | null;
  setHoveredSlot: (slot: string | null) => void;
  slotLessons: Map<string, Lesson>;
  onDragStart: (event: React.DragEvent, payload: DragPayload) => void;
  onDrop: (event: React.DragEvent, day: WeekDay, timeSlotId: string) => void;
  onPlaceSelected: (day: WeekDay, timeSlotId: string) => void;
  onUpdateLesson: (lessonId: string, patch: Partial<Pick<Lesson, "teacherId" | "roomId">>) => void;
  rooms: ReturnType<typeof import("@/lib/schedule").createLookups>["rooms"] extends Map<string, infer T>
    ? T[]
    : never;
  teachers: ReturnType<typeof import("@/lib/schedule").createLookups>["teachers"] extends Map<string, infer T>
    ? T[]
    : never;
}) {
  return (
    <>
      <div className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white p-3 text-sm font-medium text-slate-600">
        {props.timeLabel}
      </div>
      {props.days.map((day) => {
        const lesson = props.slotLessons.get(slotKey(day, props.timeSlotId));
        const placement = props.placementFor(props.activePayload, day, props.timeSlotId);
        const currentSlotKey = slotKey(day, props.timeSlotId);
        const isHovered = props.hoveredSlot === currentSlotKey;

        return (
          <div
            key={currentSlotKey}
            className={`min-h-32 border-b border-r border-slate-200 p-2 transition-colors ${
              placement?.ok ? "bg-emerald-50" : placement && !placement.ok ? "bg-rose-50" : ""
            } ${isHovered ? "ring-2 ring-inset ring-slate-900" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              props.setHoveredSlot(currentSlotKey);
            }}
            onDragLeave={() => props.setHoveredSlot(null)}
            onDrop={(event) => props.onDrop(event, day, props.timeSlotId)}
            onClick={() => {
              if (!lesson) props.onPlaceSelected(day, props.timeSlotId);
            }}
            title={placement && !placement.ok ? placement.reason : undefined}
          >
            {lesson ? (
              <LessonCard
                lesson={lesson}
                lessons={props.lessons}
                lookups={props.lookups}
                rooms={props.rooms}
                teachers={props.teachers}
                onDragStart={props.onDragStart}
                onUpdateLesson={props.onUpdateLesson}
              />
            ) : (
              <div className="flex h-full min-h-24 items-center justify-center rounded-md border border-dashed border-slate-200 px-3 text-center text-xs text-slate-400">
                {placement && !placement.ok
                  ? placement.reason
                  : placement?.ok
                    ? "Можно поставить сюда"
                    : "Свободный слот"}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
