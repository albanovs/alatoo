import type {
  DropTarget,
  Lesson,
  PlacementContext,
  Room,
  ScheduleData,
  Section,
  Teacher,
  ValidationResult,
  WeekDay,
} from "./types";

export const dayLabels: Record<WeekDay, string> = {
  MON: "Пн",
  TUE: "Вт",
  WED: "Ср",
  THU: "Чт",
  FRI: "Пт",
};

export type Lookups = {
  courses: Map<string, ScheduleData["courses"][number]>;
  teachers: Map<string, Teacher>;
  rooms: Map<string, Room>;
  sections: Map<string, Section>;
};

export function createLookups(data: ScheduleData): Lookups {
  return {
    courses: new Map(data.courses.map((item) => [item.id, item])),
    teachers: new Map(data.teachers.map((item) => [item.id, item])),
    rooms: new Map(data.rooms.map((item) => [item.id, item])),
    sections: new Map(data.sections.map((item) => [item.id, item])),
  };
}

export function slotKey(day: WeekDay, timeSlotId: string) {
  return `${day}:${timeSlotId}`;
}

export function lessonsBySlot(lessons: Lesson[]) {
  return new Map(lessons.map((lesson) => [slotKey(lesson.day, lesson.timeSlotId), lesson]));
}

export function sectionProgress(sectionId: string, lessons: Lesson[]) {
  return lessons.filter((lesson) => lesson.sectionId === sectionId).length;
}

export function getSectionStatus(section: Section, lessons: Lesson[]) {
  const planned = sectionProgress(section.id, lessons);

  if (planned === 0) return "empty";
  if (planned >= section.requiredLessonsPerWeek) return "done";
  return "partial";
}

export function findDefaultRoom(section: Section, rooms: Room[]) {
  return (
    rooms.find(
      (room) =>
        room.type === section.preferredRoomType && room.capacity >= section.studentsCount,
    ) ?? rooms.find((room) => room.capacity >= section.studentsCount)
  );
}

export function validateLessonPlacement(
  data: ScheduleData,
  lessons: Lesson[],
  section: Section,
  target: DropTarget,
  movingLessonId?: string,
  context: PlacementContext = {},
): ValidationResult {
  const teacherId = context.teacherId ?? section.teacherId ?? section.allowedTeacherIds[0];
  const sectionLessonsCount = lessons.filter((lesson) => lesson.sectionId === section.id).length;

  if (!movingLessonId && sectionLessonsCount >= section.requiredLessonsPerWeek) {
    return {
      ok: false,
      reason: "Все занятия этой секции уже распределены",
    };
  }

  if (!teacherId) {
    return { ok: false, reason: "Для секции не назначен преподаватель" };
  }

  const room = context.roomId
    ? data.rooms.find((item) => item.id === context.roomId)
    : findDefaultRoom(section, data.rooms);

  if (!room) {
    return { ok: false, reason: "Нет аудитории с подходящей вместимостью" };
  }

  const sameSlotLessons = lessons.filter(
    (lesson) =>
      lesson.id !== movingLessonId &&
      lesson.day === target.day &&
      lesson.timeSlotId === target.timeSlotId,
  );

  if (sameSlotLessons.some((lesson) => lesson.teacherId === teacherId)) {
    return { ok: false, reason: "Преподаватель уже занят в это время" };
  }

  if (sameSlotLessons.some((lesson) => lesson.roomId === room.id)) {
    return { ok: false, reason: "Подходящая аудитория уже занята" };
  }

  if (room.capacity < section.studentsCount) {
    return { ok: false, reason: "Вместимость аудитории меньше размера группы" };
  }

  const blocked = data.teacherBlockedSlots.find(
    (item) =>
      item.teacherId === teacherId &&
      item.day === target.day &&
      item.timeSlotId === target.timeSlotId,
  );

  if (blocked) {
    return { ok: false, reason: "Преподаватель недоступен в выбранный слот" };
  }

  const duplicatedSectionSlot = sameSlotLessons.some(
    (lesson) => lesson.sectionId === section.id,
  );

  if (duplicatedSectionSlot) {
    return { ok: false, reason: "Эта секция уже стоит в выбранном слоте" };
  }

  if (sameSlotLessons.length > 0) {
    return { ok: false, reason: "Слот уже занят другим занятием" };
  }

  return { ok: true, roomId: room.id, teacherId };
}

export function upsertLesson(
  lessons: Lesson[],
  section: Section,
  target: DropTarget,
  placement: Extract<ValidationResult, { ok: true }>,
  movingLessonId?: string,
) {
  if (movingLessonId) {
    return lessons.map((lesson) =>
      lesson.id === movingLessonId
        ? {
            ...lesson,
            day: target.day,
            timeSlotId: target.timeSlotId,
            roomId: placement.roomId,
            teacherId: placement.teacherId,
          }
        : lesson,
    );
  }

  return [
    ...lessons,
    {
      id: `L_${crypto.randomUUID()}`,
      sectionId: section.id,
      teacherId: placement.teacherId,
      roomId: placement.roomId,
      day: target.day,
      timeSlotId: target.timeSlotId,
    },
  ];
}
