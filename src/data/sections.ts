export type SectionId =
  | "education"
  | "projects"
  | "art"
  | "experience"
  | "about";

export type BubbleVariant = "coral" | "projects" | "blue" | "violet" | "lilac";

export type SectionMeta = {
  id: SectionId;
  title: string;
  path: string;
  placeholder: string[];
  variant: BubbleVariant;
};

export const SECTIONS: SectionMeta[] = [
  {
    id: "education",
    title: "Education",
    path: "/education",
    variant: "violet",
    placeholder: [
      "School and program details will go here.",
      "Coursework, awards, and what I’m studying next.",
    ],
  },
  {
    id: "projects",
    title: "Projects",
    path: "/projects",
    variant: "projects",
    placeholder: [
      "Featured projects will live here.",
      "Links, screenshots, and short write-ups coming soon.",
    ],
  },
  {
    id: "art",
    title: "Art",
    path: "/art",
    variant: "blue",
    placeholder: [
      "A gallery of drawings, designs, and experiments.",
      "New pieces will appear here.",
    ],
  },
  {
    id: "experience",
    title: "Experience",
    path: "/experience",
    variant: "coral",
    placeholder: [
      "Roles, internships, and collaborations.",
      "Timeline and highlights coming soon.",
    ],
  },
  {
    id: "about",
    title: "More about me",
    path: "/about",
    variant: "lilac",
    placeholder: [
      "Resume, contact, where I come from, and hobbies.",
      "More personal notes will land here.",
    ],
  },
];

/** Relative layout slots for idle bubbles (percent of field). */
export const BUBBLE_SLOTS: Record<
  SectionId,
  { x: number; y: number; size: number }
> = {
  education: { x: 22, y: 26, size: 24 },
  projects: { x: 50, y: 20, size: 26 },
  art: { x: 76, y: 30, size: 22 },
  experience: { x: 34, y: 55, size: 24 },
  about: { x: 64, y: 56, size: 28 },
};
