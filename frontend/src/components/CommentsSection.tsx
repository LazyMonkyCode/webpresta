import React, { useState } from 'react';

interface Comment {
  id: number;
  text: string;
  date: string;
}

const CommentsSection: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState('');

  const handleAddComment = () => {
    if (input.trim().length === 0) return;
    setComments([
      ...comments,
      {
        id: Date.now(),
        text: input,
        date: new Date().toLocaleString('es-AR'),
      },
    ]);
    setInput('');
  };

  const handleDelete = (id: number) => {
    setComments(comments.filter((c) => c.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4">Comentarios</h3>
      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
        {comments.length === 0 && <p className="text-gray-400">No hay comentarios aún.</p>}
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start justify-between bg-gray-50 rounded p-2">
            <div>
              <p className="text-sm text-gray-800">{comment.text}</p>
              <span className="text-xs text-gray-400">{comment.date}</span>
            </div>
            <button
              className="ml-2 text-red-500 hover:text-red-700 text-xs"
              onClick={() => handleDelete(comment.id)}
              title="Eliminar comentario"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Agregar un comentario..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
        />
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          onClick={handleAddComment}
        >
          Agregar
        </button>
      </div>
    </div>
  );
};

export default CommentsSection; 