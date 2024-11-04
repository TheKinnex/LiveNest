/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaUpload, FaTimes } from 'react-icons/fa';
import { WithContext as ReactTags } from 'react-tag-input';
import { v4 as uuidv4 } from 'uuid';
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
import SortableMediaItem from '../utils/SortableMediaItem';

const CreatePost = () => {
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tagLimitMessage, setTagLimitMessage] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  const KeyCodes = {
    comma: 188,
    enter: 13,
  };

  const delimiters = [KeyCodes.comma, KeyCodes.enter];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/current`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsPremium(response.data.isPremium);
      } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error);
        setErrorMessage('No se pudo verificar tu suscripción. Inténtalo de nuevo.');
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleAddition = (tag) => {
    if (tags.length >= 6) {
      setTagLimitMessage('Límite de 6 etiquetas alcanzado.');
      return;
    }
    setTags([...tags, tag]);
    setTagLimitMessage('');
  };

  const handleDelete = (i) => {
    setTags(tags.filter((tag, index) => index !== i));
    setTagLimitMessage('');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (mediaFiles.length + files.length > 20) {
      setErrorMessage('Solo se permite subir un máximo de 20 archivos.');
      return;
    }

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const validVideoTypes = ['video/mp4', 'video/mpeg'];
    const validTypes = isPremium ? [...validImageTypes, ...validVideoTypes] : validImageTypes;

    for (let file of files) {
      if (!validTypes.includes(file.type)) {
        setErrorMessage(
          isPremium
            ? 'Solo se permiten imágenes (jpeg, png, gif) y videos (mp4, mpeg).'
            : 'Solo se permiten imágenes (jpeg, png, gif) y videos si solo eres premium.'
        );
        return;
      }
    }

    const filesWithId = files.map((file) => ({
      id: uuidv4(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setMediaFiles([...mediaFiles, ...filesWithId]);
    setErrorMessage('');
  };

  const handleRemoveMedia = (id) => {
    const updatedMedia = mediaFiles.filter((media) => media.id !== id);
    setMediaFiles(updatedMedia);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = mediaFiles.findIndex((media) => media.id === active.id);
      const newIndex = mediaFiles.findIndex((media) => media.id === over.id);
      setMediaFiles((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!content.trim()) {
      setErrorMessage('La descripcion del post no puede estar vacío.');
      return;
    }

    if (content.length > 500) {
      setErrorMessage('La descripción no puede exceder los 500 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('content', content);

      const tagsArray = tags.map((tag) => tag.text);
      formData.append('tags', JSON.stringify(tagsArray));

      mediaFiles.forEach((media) => {
        formData.append('media', media.file);
      });

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/posts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
        },
      });

      setSuccessMessage('Post creado exitosamente.');
      setContent('');
      setTags([]);
      setMediaFiles([]);

      setTimeout(() => {
        navigate(`/profile/${localStorage.getItem('username') || sessionStorage.getItem('username')}`);
      }, 2000);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.msg || 'Hubo un error al crear el post. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      mediaFiles.forEach((media) => URL.revokeObjectURL(media.preview));
    };
  }, [mediaFiles]);

  return (
    <main className='bg-gray-900 w-full h-fit flex flex-col'>
      <header className=' fixed w-full top-0 flex items-center justify-between px-4 py-3 bg-gray-800 z-20 '>
        <button
          onClick={() => navigate('/')}
          className='text-white text-xl focus:outline-none'
          aria-label="Cerrar y regresar al inicio"
        >
          <FaTimes />
        </button>
        <h1 className='text-white text-lg font-semibold'>Nueva Publicación</h1>
        <button
          onClick={handleSubmit}
          disabled={mediaFiles.length < 1 || loading}
          className={`text-white text-lg font-semibold ${mediaFiles.length < 1 || loading ? 'opacity-50 cursor-not-allowed' : 'hover:underline'}`}
          aria-label="Siguiente"
        >
          Publicar
        </button>
      </header>

      <div className='flex-1  h-full p-4 mt-10'>
        {errorMessage && <p className="text-red-500 text-sm mb-4 text-center">{errorMessage}</p>}
        {successMessage && <p className="text-green-500 text-sm mb-4 text-center">{successMessage}</p>}

        {mediaFiles.length > 0 && (
          <div className='mb-4'>
            <div className='w-full h-[22rem] md:h-[31rem] bg-gray-700 rounded-md overflow-hidden mb-2'>
              {mediaFiles.map((media, index) => (
                <div
                  key={media.id}
                  className={`w-full h-full transition-opacity duration-500 ${index === 0 ? 'opacity-100' : 'opacity-0'}`}
                >
                  {media.file.type.startsWith('image') ? (
                    <img
                      src={media.preview}
                      alt={`Media Preview ${index + 1}`}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <video
                      src={media.preview}
                      className='w-full h-full object-cover'
                      controls
                    />
                  )}
                </div>
              ))}
            </div>

            <SortableContext
              items={mediaFiles.map((media) => media.id)}
              strategy={verticalListSortingStrategy}
            >
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className='flex space-x-2 overflow-x-auto'>
                  {mediaFiles.map((media) => (
                    <SortableMediaItem
                      key={media.id}
                      id={media.id}
                      media={media}
                      handleRemoveMedia={handleRemoveMedia}
                    />
                  ))}
                </div>
              </DndContext>
            </SortableContext>
          </div>
        )}

        <div className='flex flex-col mb-4'>
          <label
            htmlFor="media-upload"
            className="mt-2 inline-flex items-center bg-purple-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-purple-500"
          >
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

        <div className='flex flex-col mb-4'>
          <label htmlFor="description" className='text-sm text-white mb-1'>Descripción</label>
          <textarea
            id="description"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe tu publicación (máximo 500 caracteres)"
            className='w-full h-32 p-3 rounded-md text-gray-800 resize-none'
            maxLength={500}
            required
          />
          <div className="flex justify-end text-gray-400 text-xs mt-1">
            {content.length}/500 caracteres
          </div>
        </div>

        <div className='flex flex-col mb-16'>
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
              tagInput: 'flex flex-wrap border rounded p-2 bg-gray-700 relative mt-4',
              tag: ' text-white border text-white px-3 py-1 rounded-full mr-2 mb-2 flex items-center shadow-md',
              tagInputField: 'bg-gray-700 text-white p-1 rounded-md focus:outline-none',
              remove: 'ml-2 text-gray-300 cursor-pointer hover:text-red-500',
            }}
          />
          <small className="text-gray-400">Máximo 6 etiquetas.</small>
          {tagLimitMessage && (
            <p className="text-red-500 text-xs mt-2">{tagLimitMessage}</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default CreatePost;
