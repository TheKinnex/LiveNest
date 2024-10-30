/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {  FaPlus, FaUpload } from 'react-icons/fa';
import { WithContext as ReactTags } from 'react-tag-input';
import { v4 as uuidv4 } from 'uuid'; // Importar uuid para generar IDs únicos
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableMediaItem from '../utils/SortableMediaItem'; // Componente personalizado para elementos sortables

const CreatePost = () => {
  const navigate = useNavigate();
  
  // Estados para el contenido del post, etiquetas y archivos multimedia
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para React Tags
  const KeyCodes = {
    comma: 188,
    enter: 13,
  };
  
  const delimiters = [KeyCodes.comma, KeyCodes.enter];
  
  // Sensores para @dnd-kit/core
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Manejar adición de una etiqueta
  const handleAddition = (tag) => {
    if (tags.length < 10) { // Limitar a 10 etiquetas
      setTags([...tags, tag]);
    }
  };
  
  // Manejar eliminación de una etiqueta
  const handleDelete = (i) => {
    setTags(tags.filter((tag, index) => index !== i));
  };
  
  // Manejar subida de archivos
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validar número de archivos
    if (mediaFiles.length + files.length > 20) {
      setErrorMessage('Solo se permite subir un máximo de 20 archivos.');
      return;
    }
    
    // Validar tipo de archivos
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mpeg'];
    for (let file of files) {
      if (!validTypes.includes(file.type)) {
        setErrorMessage('Solo se permiten imágenes (jpeg, png, gif) y videos (mp4, mpeg).');
        return;
      }
    }
    
    // Asignar un ID único a cada archivo y agregar al estado
    const filesWithId = files.map(file => ({
      id: uuidv4(), // ID único
      file,
      preview: URL.createObjectURL(file), // Crear vista previa
    }));
    
    setMediaFiles([...mediaFiles, ...filesWithId]);
    setErrorMessage('');
  };
  
  // Manejar eliminación de un archivo multimedia
  const handleRemoveMedia = (id) => {
    const updatedMedia = mediaFiles.filter(media => media.id !== id);
    setMediaFiles(updatedMedia);
  };
  
  // Manejar reordenamiento de archivos multimedia
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = mediaFiles.findIndex(media => media.id === active.id);
      const newIndex = mediaFiles.findIndex(media => media.id === over.id);
      setMediaFiles((items) => arrayMove(items, oldIndex, newIndex));
    }
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    // Validar contenido
    if (!content.trim()) {
      setErrorMessage('El contenido del post no puede estar vacío.');
      return;
    }
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      // Agregar etiquetas
      const tagsArray = tags.map(tag => tag.text);
      formData.append('tags', JSON.stringify(tagsArray));
      
      // Agregar archivos multimedia
      mediaFiles.forEach(media => {
        formData.append('media', media.file);
      });
      
      // Realizar solicitud al backend
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/posts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
        },
      });
      
      setSuccessMessage('Post creado exitosamente.');
      setContent('');
      setTags([]);
      setMediaFiles([]);
      
      // Redirigir después de un breve retraso
      setTimeout(() => {
        navigate('/conversations');
      }, 2000);
      
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.msg || 'Hubo un error al crear el post. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Revocar URLs de vistas previas al desmontar el componente para liberar memoria
  useEffect(() => {
    return () => {
      mediaFiles.forEach(media => URL.revokeObjectURL(media.preview));
    };
  }, [mediaFiles]);
  
  return (
    <main className='bg-[#111827] w-full min-h-screen flex justify-center items-start p-4'>
      <div className='w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-lg'>
        <h2 className='text-2xl font-semibold mb-4 text-center text-white'>Crear Nuevo Post</h2>
        
        {/* Mensajes de Éxito y Error */}
        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
        {successMessage && <p className="text-green-500 text-sm mb-4">{successMessage}</p>}
        
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          {/* Campo de Contenido */}
          <div className='flex flex-col'>
            <label htmlFor="content" className='text-sm text-white mb-1'>Contenido</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="¿Qué estás pensando?"
              className='w-full h-32 p-3 rounded-md text-black resize-none'
              required
            />
          </div>
          
          {/* Campo de Etiquetas */}
          <div className='flex flex-col'>
            <label className='text-sm text-white mb-1'>Etiquetas</label>
            <ReactTags
              tags={tags}
              delimiters={delimiters}
              handleDelete={handleDelete}
              handleAddition={handleAddition}
              inputFieldPosition="bottom"
              autocomplete
              placeholder="Agregar una etiqueta"
              classNames={{
                tagInput: 'flex flex-wrap border rounded p-2 bg-gray-700',
                tag: 'bg-purple-600 text-white px-2 py-1 rounded mr-2 mb-2 flex items-center',
                remove: 'ml-1 text-white cursor-pointer',
                suggestions: 'absolute bg-gray-700 border border-gray-600 rounded mt-1 z-10',
                suggestion: 'px-2 py-1 hover:bg-gray-600 cursor-pointer',
              }}
            />
          </div>
          
          {/* Campo de Subida de Archivos Multimedia */}
          <div className='flex flex-col'>
            <label className='text-sm text-white mb-1 flex items-center gap-2'>
              <FaUpload /> Medios (máximo 20 archivos)
            </label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/gif,video/mp4,video/mpeg"
              onChange={handleFileChange}
              className='text-white'
            />
            {/* Botón para agregar más archivos */}
            <label htmlFor="media-upload" className='mt-2 inline-flex items-center bg-purple-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-purple-500'>
              <FaPlus className='mr-1' /> Agregar Archivos
            </label>
            <input
              id="media-upload"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/gif,video/mp4,video/mpeg"
              onChange={handleFileChange}
              className='hidden'
            />
          </div>
          
          {/* Vista Previa y Eliminación de Archivos Multimedia */}
          {mediaFiles.length > 0 && (
            <div className='flex flex-col'>
              <label className='text-sm text-white mb-2'>Vista Previa y Eliminación</label>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={mediaFiles.map(media => media.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                    
                    {mediaFiles.map((media, index) => (
                      <SortableMediaItem
                        key={media.id}
                        id={media.id}
                        media={media}
                        handleRemoveMedia={handleRemoveMedia}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
          
          {/* Botón de Envío */}
          <button
            type="submit"
            disabled={loading}
            className={`bg-purple-600 p-3 rounded-md font-medium text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Creando Post...' : 'Crear Post'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default CreatePost;
