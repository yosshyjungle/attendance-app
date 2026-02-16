import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL required");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const CLASS_NAMES = [
  "1年経営ビジネス学科",
  "1年情報ビジネス学科",
  "2年経営ビジネス学科",
  "2年情報ビジネス学科",
] as const;

// 2026年度ビジネス学科カリキュラム表.pdf 準拠
// 0=月, 1=火, 2=水, 3=木, 4=金 / 1-4=時限
const TIMETABLE: Record<
  string,
  Record<number, Record<number, string>>
> = {
  "1年経営ビジネス学科": {
    0: { 1: "文書技術とコミュニケーション", 2: "文書技術とコミュニケーション", 3: "ビジネスマナー", 4: "ビジネスマナー" },
    1: { 1: "ホスピタリティマネージメント", 2: "ホスピタリティマネージメント", 3: "経営学Ⅰ", 4: "経営学Ⅰ" },
    2: { 1: "商業簿記Ⅰ", 2: "商業簿記Ⅰ", 3: "CP基礎", 4: "CP基礎" },
    3: { 1: "関係法規", 2: "関係法規", 3: "税法概論", 4: "検定対策" },
    4: { 1: "工業簿記Ⅰ", 2: "工業簿記Ⅰ", 3: "流通経営管理", 4: "流通経営管理" },
  },
  "1年情報ビジネス学科": {
    0: { 1: "ビジネスマナー", 2: "ビジネスマナー", 3: "文書技術とコミュニケーション", 4: "文書技術とコミュニケーション" },
    1: { 1: "CPⅡ", 2: "CPⅡ", 3: "ホスピタリティマネージメント", 4: "ホスピタリティマネージメント" },
    2: { 1: "CPⅠ", 2: "CPⅠ", 3: "商業簿記Ⅰ", 4: "商業簿記Ⅰ" },
    3: { 1: "工業簿記Ⅰ", 2: "工業簿記Ⅰ", 3: "関係法規", 4: "関係法規" },
    4: { 1: "情報通信技術論", 2: "情報メディア産業論", 3: "ビジネス教養", 4: "ビジネス教養" },
  },
  "2年経営ビジネス学科": {
    0: { 1: "商業簿記Ⅱ", 2: "商業簿記Ⅱ", 3: "工業簿記Ⅱ", 4: "工業簿記Ⅱ" },
    1: { 1: "商業簿記Ⅱ", 2: "商業簿記Ⅱ", 3: "CP応用", 4: "CP応用" },
    2: { 1: "国際会計学", 2: "国際会計学", 3: "税法概論", 4: "検定対策" },
    3: { 1: "ＣＰ財務会計", 2: "ＣＰ財務会計", 3: "流通経営管理", 4: "流通経営管理" },
    4: { 1: "マーケティング概論", 2: "マーケティング概論", 3: "進路指導", 4: "進路指導" },
  },
  "2年情報ビジネス学科": {
    0: { 1: "CPⅣ", 2: "CPⅣ", 3: "システムデザイン", 4: "CPアーキテクチャ" },
    1: { 1: "国際経営学", 2: "国際経営学", 3: "マーケティング概論", 4: "マーケティング概論" },
    2: { 1: "検定対策", 2: "検定対策", 3: "工業簿記", 4: "工業簿記" },
    3: { 1: "情報通信技術論", 2: "情報通信技術論", 3: "ＣＰ財務会計", 4: "ＣＰ財務会計" },
    4: { 1: "進路指導", 2: "進路指導", 3: "CPⅢ", 4: "CPⅢ" },
  },
};

async function main() {
  const orgName = "日商簿記三鷹福祉専門学校";
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: { name: orgName },
    });
  } else if (org.name !== orgName) {
    org = await prisma.organization.update({
      where: { id: org.id },
      data: { name: orgName },
    });
  }

  const classMap: Record<string, string> = {};
  for (const className of CLASS_NAMES) {
    let cls = await prisma.class.findFirst({
      where: { organizationId: org.id, name: className },
    });
    if (!cls) {
      cls = await prisma.class.create({
        data: { organizationId: org.id, name: className },
      });
      console.log(`Created class: ${className}`);
    }
    classMap[className] = cls.id;
  }

  const subjectNames = new Set<string>();
  for (const slots of Object.values(TIMETABLE)) {
    for (const day of Object.values(slots)) {
      for (const name of Object.values(day)) {
        subjectNames.add(name);
      }
    }
  }

  const subjectMap: Record<string, string> = {};
  for (const name of subjectNames) {
    let subj = await prisma.subject.findFirst({ where: { name } });
    if (!subj) {
      subj = await prisma.subject.create({ data: { name } });
      console.log(`Created subject: ${name}`);
    }
    subjectMap[name] = subj.id;
  }

  for (const [className, days] of Object.entries(TIMETABLE)) {
    const classId = classMap[className];
    if (!classId) continue;

    for (const semester of ["FIRST", "SECOND"] as const) {
      for (const [dayStr, periods] of Object.entries(days)) {
        const dayOfWeek = parseInt(dayStr, 10);
        for (const [periodStr, subjectName] of Object.entries(periods)) {
          const period = parseInt(periodStr, 10);
          const subjectId = subjectMap[subjectName];
          if (!subjectId) continue;

          const existing = await prisma.timetableSlot.findFirst({
            where: { classId, dayOfWeek, period, semester },
          });
          if (!existing) {
            await prisma.timetableSlot.create({
              data: { classId, dayOfWeek, period, subjectId, semester },
            });
          }
        }
      }
    }
  }
  console.log("Created timetable slots");

  // ダミー学生5件（1年情報ビジネス学科）
  const DUMMY_STUDENTS = [
    { clerkId: "user_dummy_1", name: "山田太郎", studentNo: "37001" },
    { clerkId: "user_dummy_2", name: "佐藤花子", studentNo: "37002" },
    { clerkId: "user_dummy_3", name: "鈴木一郎", studentNo: "37003" },
    { clerkId: "user_dummy_4", name: "高橋美咲", studentNo: "37004" },
    { clerkId: "user_dummy_5", name: "田中健太", studentNo: "37005" },
  ];

  const infoClassId = classMap["1年情報ビジネス学科"];
  if (infoClassId) {
    for (const s of DUMMY_STUDENTS) {
      const existingUser = await prisma.user.findUnique({
        where: { clerkId: s.clerkId },
      });
      if (!existingUser) {
        await prisma.user.create({
          data: {
            clerkId: s.clerkId,
            name: s.name,
            email: `${s.clerkId}@example.com`,
            role: "STUDENT",
          },
        });
      }

      const existingStudent = await prisma.student.findUnique({
        where: { userId: s.clerkId },
      });
      if (!existingStudent) {
        await prisma.student.create({
          data: {
            classId: infoClassId,
            userId: s.clerkId,
            name: s.name,
            studentNo: s.studentNo,
          },
        });
        console.log(`Created student: ${s.name} (${s.studentNo})`);
      }
    }
    console.log("Created dummy students (5件)");
  }

  console.log("Seed completed.");
  console.log("前期: 4/1～9/30, 後期: 10/1～3/31");
  console.log("授業: 月～金 1～4時限");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
