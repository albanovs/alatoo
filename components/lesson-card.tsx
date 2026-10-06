import { sectionProgress } from "@/lib/schedule";
import type { DragPayload, Lesson } from "@/lib/types";

export function LessonCard({
  lesson,
  lessons,
  lookups,
  rooms,
  teachers,
  onDragStart,
  onUpdateLesson,
}: {
  lesson: Lesson;
  lessons: Lesson[];
  lookups: ReturnType<typeof import("@/lib/schedule").createLookups>;
  rooms: ReturnType<typeof import("@/lib/schedule").createLookups>["rooms"] extends Map<string, infer T>
    ? T[]
    : never;
  teachers: ReturnType<typeof import("@/lib/schedule").createLookups>["teachers"] extends Map<string, infer T>
    ? T[]
    : never;
  onDragStart: (event: React.DragEvent, payload: DragPayload) => void;
  onUpdateLesson: (lessonId: string, patch: Partial<Pick<Lesson, "teacherId" | "roomId">>) => void;
}) {
  const section = lookups.sections.get(lesson.sectionId);
  const course = section ? lookups.courses.get(section.courseId) : null;
  const room = lookups.rooms.get(lesson.roomId);
  const availableTeachers = section
    ? teachers.filter((teacher) => section.allowedTeacherIds.includes(teacher.id))
    : teachers;
  const availableRooms = section
    ? rooms.filter((item) => item.capacity >= section.studentsCount)
    : rooms;
  const planned = section ? sectionProgress(section.id, lessons) : 0;

  return (
    <article
      draggable
      onDragStart={(event) => onDragStart(event, { type: "lesson", lessonId: lesson.id })}
      className="h-full cursor-grab rounded-md border border-slate-300 bg-white p-2 shadow-sm active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">{section?.code ?? "Секция"}</h3>
          <p className="line-clamp-1 text-xs text-slate-500">{course?.name ?? ""}</p>
        </div>
        {section ? (
          <span className="text-xs text-slate-500">
            {planned}/{section.requiredLessonsPerWeek}
          </span>
        ) : null}
      </div>

      {section ? (
        <p className="mt-2 text-xs text-slate-600">Студентов: {section.studentsCount}</p>
      ) : null}

      <div className="mt-3 space-y-2">
        <label className="block text-[11px] font-medium text-slate-500">
          Преподаватель
          <select
            className="mt-1 h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs text-slate-900"
            value={lesson.teacherId}
            onChange={(event) => onUpdateLesson(lesson.id, { teacherId: event.target.value })}
          >
            {availableTeachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.shortName}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-[11px] font-medium text-slate-500">
          Аудитория
          <select
            className="mt-1 h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs text-slate-900"
            value={lesson.roomId}
            onChange={(event) => onUpdateLesson(lesson.id, { roomId: event.target.value })}
          >
            {availableRooms.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}, {item.capacity} мест
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Сейчас: {room?.name ?? "аудитория не выбрана"}
      </p>
    </article>
  );
}
