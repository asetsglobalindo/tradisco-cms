import {Editor} from "@tiptap/react";
import {Toggle} from "../ui/toggle";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Check,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";
import {Separator} from "../ui/separator";
import React, {useCallback} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "../ui/popover";

interface Props {
  editor: Editor | null;
}

const colors = [
  "#C88246",
  "#4D4D4D",
  "#000000", // Black
  "#FFFFFF", // White
  "#FF0000", // Red
  "#008000", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FFA500", // Orange
  "#800080", // Purple
  "#FFC0CB", // Pink
  "#333333", // Dark Gray
  "#808080", // Gray
  "#D3D3D3", // Light Gray
  "#ADD8E6", // Pastel Blue
  "#98FB98", // Pastel Green
  "#FFB6C1", // Pastel Pink
  "#FFFACD", // Pastel Yellow
];

const TextGroup: React.FC<Props> = ({editor}) => {
  const setLink = useCallback(() => {
    if (editor) {
      const previousUrl = editor.getAttributes("link").href;
      const url = window.prompt("URL", previousUrl);

      // cancelled
      if (url === null) {
        return;
      }

      // empty
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();

        return;
      }

      // update link
      editor.chain().focus().extendMarkRange("link").setLink({href: url}).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <React.Fragment>
      <Toggle
        pressed={editor.isActive("heading", {level: 1})}
        onPressedChange={() => {
          editor.chain().focus().toggleHeading({level: 1}).run();
        }}
      >
        <Heading1 className="w-4 h-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("heading", {level: 2})}
        onPressedChange={() => {
          editor.chain().focus().toggleHeading({level: 2}).run();
        }}
      >
        <Heading2 className="w-4 h-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("heading", {level: 3})}
        onPressedChange={() => {
          editor.chain().focus().toggleHeading({level: 3}).run();
        }}
      >
        <Heading3 className="w-4 h-4" />
      </Toggle>
      <Toggle pressed={editor.isActive("bold")} onPressedChange={setLink}>
        <Link className="w-4 h-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("bold")}
        onPressedChange={() => {
          editor.chain().focus().toggleBold().run();
        }}
      >
        <Bold className="w-4 h-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("italic")}
        onPressedChange={() => {
          editor.chain().focus().toggleItalic().run();
        }}
      >
        <Italic className="w-4 h-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("underline")}
        onPressedChange={() => {
          editor.chain().focus().toggleUnderline().run();
        }}
      >
        <Underline className="w-4 h-4" />
      </Toggle>

      <Popover>
        <PopoverTrigger>
          <Toggle>
            <Baseline className="w-4 h-4" stroke={editor.getAttributes("textStyle").color || "currentColor"} />
          </Toggle>
        </PopoverTrigger>
        <PopoverContent className="max-w-max w-max">
          <section className="grid grid-cols-12 gap-2 max-w-max">
            {colors.map((color) => (
              <button
                type="button"
                onClick={() => editor.chain().focus().setColor(color).run()}
                className="flex items-center justify-center w-5 h-5 aspect-square"
                style={{backgroundColor: color}}
              >
                {editor.getAttributes("textStyle").color === color && <Check className="shadow-lg" width={12} />}
              </button>
            ))}
          </section>
        </PopoverContent>
      </Popover>
    </React.Fragment>
  );
};
const TextAlign: React.FC<Props> = ({editor}) => {
  if (!editor) {
    return null;
  }

  return (
    <React.Fragment>
      <Toggle
        pressed={editor.isActive({textAlign: "left"})}
        onPressedChange={() => {
          editor.chain().focus().setTextAlign("left").run();
        }}
      >
        <AlignLeft className="w-4 h-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive({textAlign: "center"})}
        onPressedChange={() => {
          editor.chain().focus().setTextAlign("center").run();
        }}
      >
        <AlignCenter className="w-4 h-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive({textAlign: "right"})}
        onPressedChange={() => {
          editor.chain().focus().setTextAlign("right").run();
        }}
      >
        <AlignRight className="w-4 h-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive({textAlign: "justify"})}
        onPressedChange={() => {
          editor.chain().focus().setTextAlign("justify").run();
        }}
      >
        <AlignJustify className="w-4 h-4" />
      </Toggle>
    </React.Fragment>
  );
};
const TextList: React.FC<Props> = ({editor}) => {
  if (!editor) {
    return null;
  }

  return (
    <React.Fragment>
      <Toggle
        pressed={editor.isActive({textAlign: "orderedList"})}
        onPressedChange={() => {
          editor.chain().focus().toggleOrderedList().run();
        }}
      >
        <List className="w-4 h-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive({textAlign: "bulletList"})}
        onPressedChange={() => {
          editor.chain().focus().toggleBulletList().run();
        }}
      >
        <ListOrdered className="w-4 h-4" />
      </Toggle>
    </React.Fragment>
  );
};

const Toolbar: React.FC<Props> = ({editor}) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 p-1 mb-2 border rounded-md">
      <TextGroup editor={editor} />
      <Separator className="h-auto" orientation="vertical" />
      <TextAlign editor={editor} />
      <Separator className="h-auto" orientation="vertical" />
      <TextList editor={editor} />
    </div>
  );
};

export default Toolbar;
