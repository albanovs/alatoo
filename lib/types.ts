export type WeekDay = "MON" | "TUE" | "WED" | "THU" | "FRI";
export type RoomType = "LECTURE" | "COMPUTER_LAB";

export type TimeSlot = {
  id: string;
  start: string;
  end: string;
};

export type Course = {
  id: string;
  code: string;
  name: string;
};

export type Teacher = {
  id: string;
  name: string;
  shortName: string;
};

export type Room = {
  id: string;
  name: string;
  capacity: number;
  type: RoomType;
};

export type Section = {
  id: string;
  courseId: string;
  code: string;
  studentsCount: number;
  requiredLessonsPerWeek: number;
  teacherId: string | null;
  allowedTeacherIds: string[];
  preferredRoomType: RoomType;
};

export type TeacherBlockedSlot = {
  teacherId: string;
  day: WeekDay;
  timeSlotId: string;
  reason: string;
};

export type Lesson = {
  id: string;
  sectionId: string;
  teacherId: string;
  roomId: string;
  day: WeekDay;
  timeSlotId: string;
};

export type ScheduleData = {
  meta: {
    title: string;
    version: number;
    weekDays: Array<{ id: WeekDay; label: string }>;
  };
  timeSlots: TimeSlot[];
  courses: Course[];
  teachers: Teacher[];
  rooms: Room[];
  sections: Section[];
  teacherBlockedSlots: TeacherBlockedSlot[];
  lessons: Lesson[];
};

export type DraftLesson = {
  sectionId: string;
  lessonId?: string;
};

export type DropTarget = {
  day: WeekDay;
  timeSlotId: string;
};

export type PlacementContext = {
  teacherId?: string;
  roomId?: string;
};

export type DragPayload =
  | { type: "section"; sectionId: string }
  | { type: "lesson"; lessonId: string };

export type ValidationResult =
  | { ok: true; roomId: string; teacherId: string }
  | { ok: false; reason: string };
