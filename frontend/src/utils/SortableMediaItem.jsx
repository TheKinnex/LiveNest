/* eslint-disable react/prop-types */
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaTimes } from 'react-icons/fa';


const SortableMediaItem = ({ id, media, handleRemoveMedia }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='relative group cursor-grab'
      {...attributes}
      {...listeners}
    >
      {/* Vista Previa de la Imagen o Video */}
      {media.file.type.startsWith('image') ? (
        <img
          src={media.preview}
          alt={`Media Preview`}
          className='w-full h-32 object-cover rounded-md'
        />
      ) : (
        <video
          src={media.preview}
          className='w-full h-32 object-cover rounded-md'
          controls
        />
      )}
      {/* Botón para Eliminar */}
      <button
        type="button"
        onClick={() => handleRemoveMedia(id)}
        className='absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
        aria-label="Eliminar medio"
      >
        <FaTimes size={12} />
      </button>
    </div>
  );
};

export default SortableMediaItem;
