import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { WithContext as ReactTags } from 'react-tag-input';
import { FaSpinner, FaTimes } from 'react-icons/fa';

const EditPost = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [author, setAuthor] = useState('');

    const KeyCodes = {
        comma: 188,
        enter: 13,
    };
    const delimiters = [KeyCodes.comma, KeyCodes.enter];

    const handleAddition = (tag) => {
        if (tags.length < 10) {
            setTags([...tags, tag]);
            setErrorMessage('');
        } else {
            setErrorMessage('Solo se permiten un máximo de 10 etiquetas.');
        }
    };

    const handleDelete = (i) => {
        setTags(tags.filter((tag, index) => index !== i));
        setErrorMessage('');
    };

    const fetchPost = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${postId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` },
            });
            const post = response.data;

            if (!post) {
                setErrorMessage('Post no encontrado.');
                setLoading(false);
                return;
            }

            const { content, tags } = post;
            setAuthor(post.author.username);
            setContent(content || '');

            // Procesar etiquetas dependiendo del formato
            let formattedTags = [];
            if (Array.isArray(tags)) {
                if (tags.length === 1 && typeof tags[0] === 'string') {
                    // las etiquetas están en una sola cadena JSON en el primer elemento
                    try {
                        const parsedTags = JSON.parse(tags[0]);
                        if (Array.isArray(parsedTags)) {
                            formattedTags = parsedTags.map((tag, index) => ({ id: index.toString(), text: tag }));
                        }
                    } catch (e) {
                        console.error("Error al analizar etiquetas:", e);
                    }
                } else {
                    // las etiquetas ya están en el formato correcto (array de strings)
                    formattedTags = tags.map((tag, index) => ({ id: index.toString(), text: tag }));
                }
            }

            setTags(formattedTags);
        } catch (error) {
            console.error(error);
            setErrorMessage('Error al cargar el post. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!content.trim()) {
            setErrorMessage('El contenido no puede estar vacío.');
            return;
        }

        if (content.length > 500) {
            setErrorMessage('El contenido debe tener menos de 500 caracteres.');
            return;
        }

        const tagsArray = tags.map(tag => tag.text);
        setSaving(true);

        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/posts/${postId}`, { content, tags: tagsArray }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` },
            });

            setSuccessMessage('Post actualizado correctamente.');
            setTimeout(() => {
                navigate(`/profile/${author}`);
            }, 2000);
        } catch (error) {
            console.error(error);
            setErrorMessage(error.response?.data?.msg || 'Hubo un error al actualizar el post. Por favor, inténtalo de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <FaSpinner className="animate-spin text-4xl text-purple-600" />
            </div>
        );
    }

    return (
        <main className="bg-gray-900 w-full h-full flex flex-col">
            <header className="fixed lg:static w-full top-0 flex items-center justify-between px-4 py-3 bg-gray-800 z-20">
                <button onClick={() => navigate(`/profile/${author}`)} className="text-white text-xl focus:outline-none" aria-label="Cerrar y regresar al perfil">
                    <FaTimes />
                </button>
                <h1 className="text-white text-lg font-semibold">Editar Publicación</h1>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className={`text-white text-lg font-semibold ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:underline'}`}
                    aria-label="Guardar Cambios"
                >
                    {saving ? 'Guardando...' : 'Guardar'}
                </button>
            </header>

            <div className="flex-1  w-full h-full p-9 mt-10">
                {successMessage && <p className="text-green-500 text-sm mb-4 text-center">{successMessage}</p>}
                {errorMessage && <p className="text-red-500 text-sm mb-4 text-center">{errorMessage}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col mb-4 lg:px-48">
                    <div className="flex flex-col">
                        <label htmlFor="content" className="text-sm text-white mb-1">Descripción</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Actualiza tu contenido"
                            className="w-full h-32 p-3 rounded-md text-gray-800 resize-none"
                            required
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-400 mt-1">{content.length}/500 caracteres</p>
                    </div>

                    <div className="flex flex-col relative mb-16">
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
                                tag: 'text-white border text-white px-3 py-1 rounded-full mr-2 mb-2 flex items-center shadow-md',
                                tagInputField: 'bg-gray-700 text-white p-1 rounded-md focus:outline-none',
                                remove: 'ml-2 text-gray-300 cursor-pointer hover:text-red-500',
                            }}
                        />
                        <small className="text-gray-400">Máximo 10 etiquetas.</small>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default EditPost;
