/* eslint-disable react/prop-types */
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaTimes, FaGripVertical } from 'react-icons/fa';

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
      className='relative group bg-gray-700 rounded-md overflow-hidden'
      {...attributes}
    >
      {/* Handle de Arrastre */}
      <div
        {...listeners}
        className='absolute top-2 left-2 text-gray-300 cursor-grab active:cursor-grabbing z-20'
        aria-label="Arrastrar medio"
      >
        <FaGripVertical />
      </div>

      {/* Botón para Eliminar */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // Evita que el clic se propague y active el arrastre
          handleRemoveMedia(id);
        }}
        className='absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-400 z-20' 
        aria-label="Eliminar medio"
      >
        <FaTimes size={12} />
      </button>

      {/* Vista Previa de la Imagen o Video */}
      <div className='w-full h-24 md:h-40 lg:h-56'>
        {media.file.type.startsWith('image') ? (
          <img
            src={media.preview}
            alt={`Media Preview`}
            className='w-24  h-full object-cover rounded-md'
          />
        ) : (
          <video
            src={media.preview}
            className='w-24  h-full object-cover rounded-md'
          />
        )}
      </div>
    </div>
  );
};

export default SortableMediaItem;
