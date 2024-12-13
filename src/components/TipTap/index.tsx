import {useEditor, EditorContent, mergeAttributes} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Toolbar from "./Toolbar";
import Heading from "@tiptap/extension-heading";
import TextAlign from "@tiptap/extension-text-align";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import {useEffect} from "react";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";

// define your extension array

interface Props {
  description: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

const Tiptap: React.FC<Props> = ({description, onChange, placeholder}) => {
  const editor = useEditor({
    extensions: [
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          class: "underline",
        },
        protocols: [
          {
            scheme: "tel",
            optionalSlashes: true,
          },
        ],
      }),
      StarterKit.configure({}),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline.configure({
        HTMLAttributes: {
          class: "underline",
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-decimal pl-4",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-disc pl-4",
        },
      }),
      Color.configure({}),
      TextStyle,
      Heading.configure({
        levels: [1, 2],
      }).extend({
        levels: [1, 2],
        renderHTML({node, HTMLAttributes}) {
          const level = this.options.levels.includes(node.attrs.level) ? node.attrs.level : this.options.levels[0];
          const classes: any = {
            1: "title1",
            2: "title2",
            3: "title3",
          };
          return [
            `h${level}`,
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
              class: `${classes[level]}`,
            }),
            0,
          ];
        },
      }),
      Placeholder.configure({
        emptyEditorClass: "is-editor-empty",
        placeholder: placeholder || "Enter something",
      }),
    ],
    content: description,
    editorProps: {
      attributes: {
        class:
          "rounded-md min-h-[250px] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      },
    },
    onUpdate: ({editor}) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    let {from, to} = editor.state.selection;
    editor.commands.setContent(description, false, {
      preserveWhitespace: "full",
    });
    editor.commands.setTextSelection({from, to});
  }, [editor, description]);

  return (
    <div className="">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default Tiptap;
