import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const toolbarOptions = [
  [{ 'font': [] }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  ['blockquote', 'link'],
  ['clean']
];

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <ReactQuill
      value={value}
      onChange={onChange}
      placeholder={placeholder || '이 챕터에서 학습한 내용을 자유롭게 기록해보세요...'}
      modules={{ toolbar: toolbarOptions }}
      theme="snow"
      style={{ minHeight: 600 }}
    />
  );
} 