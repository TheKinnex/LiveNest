/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';
import { WithContext as ReactTags } from 'react-tag-input';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { arrayMove } from '@dnd-kit/sortable';

// eslint-disable-next-line react/prop-types
const CreatePostModal = ({ isOpen, onClose, isPremium }) => {
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [tagLimitMessage, setTagLimitMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const KeyCodes = {
        comma: 188,
        enter: 13,
    };

    const delimiters = [KeyCodes.comma, KeyCodes.enter];

    useEffect(() => {
        if (!isOpen) {
            setContent('');
            setTags([]);
            setMediaFiles([]);
            setCurrentMediaIndex(0);
            setErrorMessage('');
            setTagLimitMessage('');
            setLoading(false);
            setSuccessMessage('');
        }
    }, [isOpen]);

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
                        : 'Solo se permiten imágenes (jpeg, png, gif). Si deseas subir videos, actualiza tu suscripción a Premium.'
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
        if (currentMediaIndex >= updatedMedia.length && updatedMedia.length > 0) {
            setCurrentMediaIndex(updatedMedia.length - 1);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = mediaFiles.findIndex((media) => media.id === active.id);
            const newIndex = mediaFiles.findIndex((media) => media.id === over.id);
            setMediaFiles((items) => arrayMove(items, oldIndex, newIndex));
            if (oldIndex === currentMediaIndex) {
                setCurrentMediaIndex(newIndex);
            } else if (newIndex === currentMediaIndex) {
                setCurrentMediaIndex(oldIndex);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!content.trim()) {
            setErrorMessage('La descripción del post no puede estar vacía.');
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

            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/posts`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            setSuccessMessage('Post creado exitosamente.');
            setContent('');
            setTags([]);
            setMediaFiles([]);
            setCurrentMediaIndex(0);


            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error(error);
            setErrorMessage(error.response?.data?.msg || 'Hubo un error al crear el post. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (mediaFiles.length > 0) {
            setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % mediaFiles.length);
        }
    };

    const handlePrev = () => {
        if (mediaFiles.length > 0) {
            setCurrentMediaIndex((prevIndex) => (prevIndex - 1 + mediaFiles.length) % mediaFiles.length);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-2/3 h-5/6 flex flex-col relative">
                {/* Header del Modal */}
                <header className="flex items-center justify-between px-4 py-3 bg-gray-700 rounded-t-lg">
                    <h2 className="text-white text-xl font-semibold">Crear Nueva Publicación</h2>
                    <button onClick={onClose} className="text-white text-2xl focus:outline-none" aria-label="Cerrar Modal">
                        <FaTimes />
                    </button>
                </header>

                {/* Contenido del Modal */}
                <div className="flex-1 flex flex-col md:flex-row p-4 overflow-hidden">
                    {/* Sección de Subida y Previsualización */}
                    <div className="flex-1 flex flex-col items-center ">
                        {/* Área de Subida */}
                        <div className='flex flex-col mb-4 w-96'>
                            <label
                                htmlFor="media-upload"
                                className={`inline-flex items-center justify-center bg-purple-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-purple-500`}
                                onClick={() => {
                                    if (!isPremium) {
                                        setErrorMessage('Debes ser premium para agregar videos.');
                                    }
                                }}
                            >
                                <FaPlus className="mr-2" /> Agregar Archivos
                            </label>
                            <input
                                id="media-upload"
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/gif,video/mp4,video/mpeg"
                                onChange={handleFileChange}
                                className='hidden'
                            />
                            {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
                        </div>

                        {/* Carrusel de Medios */}
                        {mediaFiles.length > 0 && (
                            <div className="relative flex-1 bg-gray-700 rounded-md overflow-hidden">
                                {/* Botón Anterior */}
                                {
                                    mediaFiles.length > 1 && (
                                        <div>
                                            <button
                                                onClick={handlePrev}
                                                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-600 text-white p-2 rounded-full hover:bg-gray-500 focus:outline-none z-20"
                                                aria-label="Anterior"
                                            >
                                                <FaChevronLeft />
                                            </button>

                                            {/* Botón Siguiente */}
                                            <button
                                                onClick={handleNext}
                                                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-600 text-white p-2 rounded-full hover:bg-gray-500 focus:outline-none z-20"
                                                aria-label="Siguiente"
                                            >
                                                <FaChevronRight />
                                            </button>
                                        </div>
                                    )
                                }

                                {/* Previsualización Actual */}
                                <div className="w-full h-full">
                                    {mediaFiles[currentMediaIndex].file.type.startsWith('image') ? (
                                        <img
                                            src={mediaFiles[currentMediaIndex].preview}
                                            alt={`Media Preview ${currentMediaIndex + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <video
                                            src={mediaFiles[currentMediaIndex].preview}
                                            className="w-full h-full object-cover"
                                            controls
                                        />
                                    )}
                                </div>

                                {/* Botón para Eliminar el Archivo Actual */}
                                <button
                                    onClick={() => handleRemoveMedia(mediaFiles[currentMediaIndex].id)}
                                    className="absolute top-2 left-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-500 focus:outline-none z-20"
                                    aria-label="Eliminar Archivo"
                                >
                                    <FaTimes />
                                </button>

                                {/* Indicadores de Posición (Puntos) */}
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                    {mediaFiles.map((_, index) => (
                                        <span
                                            key={index}
                                            className={`w-3 h-3 rounded-full cursor-pointer ${index === currentMediaIndex ? 'bg-white' : 'bg-gray-400'}`}
                                            onClick={() => setCurrentMediaIndex(index)}
                                            aria-label={`Ir a la media ${index + 1}`}
                                        ></span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sección de Descripción y Etiquetas */}
                    {mediaFiles.length > 0 && (
                        <div className="flex-1 md:ml-4 mt-4 md:mt-0 flex flex-col">
                            {/* Campo de Descripción */}
                            <div className="flex flex-col mb-4 ">
                                <label htmlFor="description" className="text-sm text-white mb-1">Descripción</label>
                                <textarea
                                    id="description"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Describe tu publicación (máximo 500 caracteres)"
                                    className="w-full h-24 p-2 rounded-md text-white resize-none bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    maxLength={500}
                                    required
                                />
                                <div className="flex justify-end text-gray-400 text-xs mt-1">
                                    {content.length}/500 caracteres
                                </div>
                            </div>

                            {/* Campo de Etiquetas */}
                            <div className="flex flex-col">
                                <label className="text-sm text-white mb-1">Etiquetas</label>
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
                                <small className="text-gray-400">Máximo 10 etiquetas.</small>
                                {tagLimitMessage && (
                                    <p className="text-red-500 text-xs mt-2">{tagLimitMessage}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer del Modal */}
                <footer className="px-4 py-3 bg-gray-700 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={mediaFiles.length < 1 || loading || tagLimitMessage}
                        className={`bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-500 focus:outline-none ${mediaFiles.length < 1 || loading || tagLimitMessage ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label="Publicar"
                    >
                        {loading ? 'Publicando...' : 'Publicar'}
                    </button>
                </footer>

                {/* Mensajes de Éxito */}
                {successMessage && (
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg">
                        {successMessage}
                    </div>
                )}
            </div>
        </div>
    );

};

export default CreatePostModal;
