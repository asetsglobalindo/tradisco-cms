import {CKEditor} from "@ckeditor/ckeditor5-react";
import {
  Base64UploadAdapter,
  ClassicEditor,
  EventInfo,
  FindAndReplace,
  GeneralHtmlSupport,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  SimpleUploadAdapter,
  SourceEditing,
} from "ckeditor5";
import {
  Bold,
  Essentials,
  Italic,
  Mention,
  Paragraph,
  Undo,
  Table,
  TableToolbar,
  Font,
  List,
  Alignment,
  Link,
  AutoLink,
  BlockQuote,
  Indent,
  IndentBlock,
  ListProperties,
  Code,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
  Heading,
} from "ckeditor5";
import React from "react";

interface Props {
  ref: React.LegacyRef<CKEditor<ClassicEditor>> | undefined;
  placeholder: string;
  value: string;
  onBlur: ((event: EventInfo, editor: ClassicEditor) => void) | undefined;
  onChange: (value: string) => void;
}

const Ckeditor5: React.FC<Props> = ({ref, onBlur, placeholder, onChange, value}) => {
  return (
    <CKEditor
      ref={ref}
      onBlur={onBlur}
      editor={ClassicEditor}
      data={value}
      onChange={(_, editor) => {
        onChange(editor.getData());
        console.log(editor.getData());
      }}
      config={{
        placeholder: placeholder,
        toolbar: {
          items: [
            "undo", // Undo action
            "redo", // Redo action
            "|",
            "heading", // Heading styles
            "|",
            "bold", // Bold text
            "italic", // Italic text
            "underline", // Underline text
            "strikethrough", // Strikethrough text
            "code", // Inline code
            "|",
            "fontSize", // Font size selection
            "fontFamily", // Font family selection
            "fontColor", // Font color picker
            "fontBackgroundColor", // Background color picker
            "|",
            "alignment", // Text alignment (left, center, right, justify)
            "|",
            "bulletedList", // Bullet list
            "numberedList", // Numbered list
            "|",
            "link", // Add hyperlinks
            "blockQuote", // Add blockquotes
            "insertTable", // Insert tables
            "|",
            "outdent", // Decrease indentation
            "indent", // Increase indentation
            "|",
            "subscript", // Subscript
            "superscript", // Superscript
            "|",
            // "insertImage",
            "findAndReplace", // Find and replace
            "sourceEditing", // Source code editing
          ],
        },
        plugins: [
          GeneralHtmlSupport,
          SourceEditing,
          FindAndReplace,
          Code,
          Strikethrough,
          Subscript,
          Superscript,
          Underline,
          Bold,
          Essentials,
          Italic,
          Mention,
          Paragraph,
          Undo,
          Table,
          TableToolbar,
          Font,
          List,
          ListProperties,
          Alignment,
          Link,
          AutoLink,
          BlockQuote,
          Indent,
          IndentBlock,
          Heading,
          Image,
          ImageToolbar,
          ImageCaption,
          ImageStyle,
          ImageResize,
          Base64UploadAdapter,
          SimpleUploadAdapter,
          ImageUpload,
        ],
        htmlSupport: {
          allow: [
            {
              name: /^(h1|h2|h3|p)$/, // Allow specific tags
              attributes: true,
              classes: true,
              styles: true,
            },
          ],
        },
        heading: {
          options: [
            {model: "paragraph", title: "Paragraph", class: ""},
            {
              model: "heading1",
              view: {name: "h1", classes: "title-1"},
              title: "Heading 1",
              class: "ck-heading_heading1",
            },
            {
              model: "heading2",
              view: {name: "h2", classes: "title-2"},
              title: "Heading 2",
              class: "ck-heading_heading2",
            },
            {
              model: "heading3",
              view: {name: "h3", classes: "title-3"},
              title: "Heading 3",
              class: "ck-heading_heading3",
            },
            {
              model: "heading4",
              view: {name: "h4", classes: "title-4"},
              title: "Heading 4",
              class: "ck-heading_heading4",
            },
          ],
        },
      }}
    />
  );
};

export default Ckeditor5;

