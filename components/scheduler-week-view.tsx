import { SlotRow } from "@/components/slot-row";
import { dayLabels } from "@/lib/schedule";
import type { DragPayload, Lesson, TimeSlot, WeekDay } from "@/lib/types";

export function SchedulerWeekView({
  weekDays,
  timeSlots,
  message,
  activePayload,
  hoveredSlot,
  lessons,
  lookups,
  slotLessons,
  placementFor,
  setHoveredSlot,
  onDragStart,
  onDrop,
  onPlaceSelected,
  onUpdateLesson,
  rooms,
  teachers,
}: {
  weekDays: WeekDay[];
  timeSlots: TimeSlot[];
  message: string;
  activePayload: DragPayload | null;
  hoveredSlot: string | null;
  lessons: Lesson[];
  lookups: ReturnType<typeof import("@/lib/schedule").createLookups>;
  slotLessons: Map<string, Lesson>;
  placementFor: (
    payload: DragPayload | null,
    day: WeekDay,
    timeSlotId: string,
  ) => ReturnType<typeof import("@/lib/schedule").validateLessonPlacement> | null;
  setHoveredSlot: (slot: string | null) => void;
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
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-col gap-2 border-b border-slate-200 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Неделя</h2>
          <p className="text-xs text-slate-500">
            Ячейка = один день и одно время. Карточки занятий можно перетаскивать.
          </p>
        </div>
        <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">{message}</p>
      </div>

      <div className="overflow-auto">
        <div className="grid min-w-[820px] grid-cols-[82px_repeat(5,minmax(145px,1fr))] sm:min-w-[940px] sm:grid-cols-[92px_repeat(5,minmax(160px,1fr))]">
          <div className="sticky left-0 z-20 border-b border-r border-slate-200 bg-slate-50 p-3 text-xs font-semibold uppercase text-slate-500">
            Время
          </div>
          {weekDays.map((day) => (
            <div
              key={day}
              className="border-b border-r border-slate-200 bg-slate-50 p-3 text-sm font-semibold"
            >
              {dayLabels[day]}
            </div>
          ))}

          {timeSlots.map((timeSlot) => (
            <SlotRow
              key={timeSlot.id}
              dayLabels={dayLabels}
              days={weekDays}
              timeSlotId={timeSlot.id}
              timeLabel={`${timeSlot.start}-${timeSlot.end}`}
              activePayload={activePayload}
              hoveredSlot={hoveredSlot}
              lessons={lessons}
              lookups={lookups}
              placementFor={placementFor}
              setHoveredSlot={setHoveredSlot}
              slotLessons={slotLessons}
              onDragStart={onDragStart}
              onDrop={onDrop}
              onPlaceSelected={onPlaceSelected}
              onUpdateLesson={onUpdateLesson}
              rooms={rooms}
              teachers={teachers}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
