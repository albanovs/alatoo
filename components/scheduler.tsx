"use client";

import { useMemo, useState } from "react";
import mockData from "@/data/schedule-mock-data.json";
import { Metric } from "@/components/metric";
import { SchedulerSidebar } from "@/components/scheduler-sidebar";
import { SchedulerWeekView } from "@/components/scheduler-week-view";
import {
  createLookups,
  getSectionStatus,
  lessonsBySlot,
  upsertLesson,
  validateLessonPlacement,
} from "@/lib/schedule";
import type { DragPayload, Lesson, ScheduleData, Section, WeekDay } from "@/lib/types";

const data = mockData as ScheduleData;
const weekDays = data.meta.weekDays.map((day) => day.id);

function readDragPayload(event: React.DragEvent): DragPayload | null {
  const raw = event.dataTransfer.getData("application/json");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DragPayload;
  } catch {
    return null;
  }
}

export default function Scheduler() {
  const [lessons, setLessons] = useState<Lesson[]>(data.lessons);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "done">("all");
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [activePayload, setActivePayload] = useState<DragPayload | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [message, setMessage] = useState("Перетащите секцию на свободный слот.");

  const lookups = useMemo(() => createLookups(data), []);
  const slotLessons = useMemo(() => lessonsBySlot(lessons), [lessons]);

  const filteredSections = data.sections.filter((section) => {
    const course = lookups.courses.get(section.courseId);
    const teacher = section.teacherId ? lookups.teachers.get(section.teacherId) : null;
    const text = `${section.code} ${course?.name ?? ""} ${teacher?.name ?? ""}`.toLowerCase();
    const status = getSectionStatus(section, lessons);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "open" && status !== "done") ||
      (statusFilter === "done" && status === "done");

    return text.includes(query.toLowerCase()) && matchesStatus;
  });

  function sectionFromPayload(payload: DragPayload) {
    if (payload.type === "section") return lookups.sections.get(payload.sectionId) ?? null;

    const lesson = lessons.find((item) => item.id === payload.lessonId);
    return lesson ? lookups.sections.get(lesson.sectionId) ?? null : null;
  }

  const selectedPayload = selectedSectionId
    ? ({ type: "section", sectionId: selectedSectionId } satisfies DragPayload)
    : null;

  function placementFor(payload: DragPayload | null, day: WeekDay, timeSlotId: string) {
    const effectivePayload = payload ?? selectedPayload;

    if (!effectivePayload) return null;

    const section = sectionFromPayload(effectivePayload);
    const movingLesson =
      effectivePayload.type === "lesson"
        ? lessons.find((lesson) => lesson.id === effectivePayload.lessonId)
        : undefined;

    if (!section) return null;
    return validateLessonPlacement(
      data,
      lessons,
      section,
      { day, timeSlotId },
      movingLesson?.id,
      movingLesson,
    );
  }

  function startDrag(event: React.DragEvent, payload: DragPayload) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/json", JSON.stringify(payload));
    setActivePayload(payload);
  }

  function dropToSlot(event: React.DragEvent, day: WeekDay, timeSlotId: string) {
    event.preventDefault();

    const payload = readDragPayload(event);
    placePayload(payload, day, timeSlotId);
  }

  function placeSelectedSection(day: WeekDay, timeSlotId: string) {
    if (!selectedPayload) return;
    placePayload(selectedPayload, day, timeSlotId);
  }

  function placePayload(payload: DragPayload | null, day: WeekDay, timeSlotId: string) {
    const section = payload ? sectionFromPayload(payload) : null;
    const movingLesson =
      payload?.type === "lesson"
        ? lessons.find((lesson) => lesson.id === payload.lessonId)
        : undefined;

    if (!payload || !section) return;

    const placement = validateLessonPlacement(
      data,
      lessons,
      section,
      { day, timeSlotId },
      movingLesson?.id,
      movingLesson,
    );

    if (!placement.ok) {
      setMessage(placement.reason);
      return;
    }

    setLessons((current) =>
      upsertLesson(current, section, { day, timeSlotId }, placement, movingLesson?.id),
    );
    setMessage(`${section.code} поставлена в выбранный слот.`);
    setHoveredSlot(null);
    setActivePayload(null);
    setSelectedSectionId(null);
  }

  function removeLesson(event: React.DragEvent) {
    event.preventDefault();

    const payload = readDragPayload(event);
    if (payload?.type !== "lesson") return;

    const lesson = lessons.find((item) => item.id === payload.lessonId);
    const section = lesson ? lookups.sections.get(lesson.sectionId) : null;

    setLessons((current) => current.filter((item) => item.id !== payload.lessonId));
    setMessage(section ? `${section.code} возвращена в список.` : "Занятие удалено.");
    setActivePayload(null);
    setSelectedSectionId(null);
  }

  function updateLesson(lessonId: string, patch: Partial<Pick<Lesson, "teacherId" | "roomId">>) {
    setLessons((current) =>
      current.map((lesson) => (lesson.id === lessonId ? { ...lesson, ...patch } : lesson)),
    );
  }

  const totalRequired = data.sections.reduce(
    (sum, section) => sum + section.requiredLessonsPerWeek,
    0,
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col gap-3 p-3 sm:gap-4 sm:p-4">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Университет</p>
            <h1 className="text-xl font-semibold tracking-normal sm:text-2xl">
              Распределение секций
            </h1>
          </div>
          <div className="grid grid-cols-3 gap-2 text-left text-sm sm:text-right">
            <Metric label="Секций" value={data.sections.length} />
            <Metric label="Занятий" value={`${lessons.length}/${totalRequired}`} />
            <Metric label="Аудиторий" value={data.rooms.length} />
          </div>
        </header>

        <section
          className={`grid min-h-0 flex-1 gap-3 transition-[grid-template-columns] duration-300 ease-out sm:gap-4 ${
            sidebarOpen
              ? "grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)]"
              : "grid-cols-1 xl:grid-cols-[64px_minmax(0,1fr)]"
          }`}
        >
          <SchedulerSidebar
            sidebarOpen={sidebarOpen}
            filteredSections={filteredSections}
            activePayload={activePayload}
            query={query}
            statusFilter={statusFilter}
            selectedSectionId={selectedSectionId}
            lessons={lessons}
            lookups={lookups}
            onToggleSidebar={() => setSidebarOpen((value) => !value)}
            onQueryChange={setQuery}
            onStatusChange={setStatusFilter}
            onRemoveLesson={removeLesson}
            onSelectSection={(sectionId) => {
              setSelectedSectionId((current) => (current === sectionId ? null : sectionId));
              setActivePayload(null);
            }}
            onDragStart={startDrag}
          />

          <SchedulerWeekView
            weekDays={weekDays}
            timeSlots={data.timeSlots}
            message={message}
            activePayload={activePayload}
            hoveredSlot={hoveredSlot}
            lessons={lessons}
            lookups={lookups}
            slotLessons={slotLessons}
            placementFor={placementFor}
            setHoveredSlot={setHoveredSlot}
            onDragStart={startDrag}
            onDrop={dropToSlot}
            onPlaceSelected={placeSelectedSection}
            onUpdateLesson={updateLesson}
            rooms={data.rooms}
            teachers={data.teachers}
          />
        </section>
      </div>
    </main>
  );
}
