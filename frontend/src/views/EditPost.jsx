import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { WithContext as ReactTags } from 'react-tag-input';
import { FaSpinner } from 'react-icons/fa';

// Estilos personalizados para ReactTags
const reactTagsStyles = {
    tagInput: 'flex flex-wrap border rounded p-2 bg-gray-700',
    tag: 'bg-purple-600 text-white px-2 py-1 rounded mr-2 mb-2 flex items-center',
    remove: 'ml-1 text-white cursor-pointer',
    suggestions: 'absolute bg-gray-700 border border-gray-600 rounded mt-1 z-10',
    suggestion: 'px-2 py-1 hover:bg-gray-600 cursor-pointer',
};

const EditPost = () => {
    const { postId } = useParams(); // Obtener el ID del post de la URL
    const navigate = useNavigate();

    // Estados para el contenido del post, etiquetas y mensajes
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true); // Estado de carga inicial
    const [saving, setSaving] = useState(false); // Estado de guardado
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [author, setAuthor] = useState('');

    // Estados para React Tags
    const KeyCodes = {
        comma: 188,
        enter: 13,
    };

    const delimiters = [KeyCodes.comma, KeyCodes.enter];

    // Funciones para manejar las etiquetas
    const handleAddition = (tag) => {
        if (tags.length < 10) { // Limitar a 10 etiquetas
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

    // Función para cargar el post existente
    const fetchPost = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${postId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
                },
            });

            // Ajustar según la estructura de la respuesta del backend
            const post = response.data;

            if (!post) {
                setErrorMessage('Post no encontrado.');
                setLoading(false);
                return;
            }

            const { content, tags } = post;
            setAuthor(post.author.username)

            setContent(content || '');

            // Manejar el formato incorrecto de las etiquetas
            let formattedTags = [];
            if (Array.isArray(tags)) {
                if (tags.length === 1 && tags[0] === "[]") {
                    formattedTags = [];
                } else {
                    formattedTags = tags.map((tag, index) => ({
                        id: index.toString(),
                        text: tag,
                    }));
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

    // Cargar el post al montar el componente
    useEffect(() => {
        fetchPost();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postId]);

    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        // Validar contenido
        if (!content.trim()) {
            setErrorMessage('El contenido no puede estar vacío.');
            return;
        }

        if (content.length > 500) {
            setErrorMessage('El contenido debe tener menos de 500 caracteres.');
            return;
        }

        // Preparar las etiquetas
        const tagsArray = tags.map(tag => tag.text);

        if (tagsArray.length > 10) {
            setErrorMessage('Solo se permiten un máximo de 10 etiquetas.');
            return;
        }

        setSaving(true);

        try {
            // Enviar la solicitud Patch al backend
            // eslint-disable-next-line no-unused-vars
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/posts/${postId}`, {
                content,
                tags: tagsArray,
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
                },
            });

            setSuccessMessage('Post actualizado correctamente.');

            // Redirigir después de un breve retraso
            setTimeout(() => {
                navigate(`/profile/${author}`);
            }, 2000);

        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 403) {
                setErrorMessage('No tienes permiso para actualizar este post.');
            } else if (error.response && error.response.status === 404) {
                setErrorMessage('Post no encontrado.');
            } else {
                setErrorMessage('Hubo un error al actualizar el post. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <FaSpinner className='animate-spin text-4xl text-purple-600' />
            </div>
        );
    }

    return (
        <main className='bg-[#111827] w-full min-h-screen flex justify-center items-start p-4'>
            <div className='w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-lg'>
                <h2 className='text-2xl font-semibold mb-4 text-center text-white'>Editar Post</h2>

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
                            placeholder="Actualiza tu contenido"
                            className='w-full h-32 p-3 rounded-md text-black resize-none'
                            required
                            maxLength={500}
                        />
                        <p className='text-xs text-gray-400 mt-1'>{content.length}/500 caracteres</p>
                    </div>

                    {/* Campo de Etiquetas */}
                    <div className='flex flex-col relative'>
                        <label className='text-sm text-white mb-1'>Etiquetas</label>
                        <ReactTags
                            tags={tags}
                            delimiters={delimiters}
                            handleDelete={handleDelete}
                            handleAddition={handleAddition}
                            inputFieldPosition="bottom"
                            autocomplete
                            placeholder="Agregar una etiqueta"
                            allowDragDrop={false} // Desactivar drag and drop dentro de las etiquetas
                            classNames={reactTagsStyles}
                        />
                    </div>

                    {/* Botón de Envío */}
                    <button
                        type="submit"
                        disabled={saving}
                        className={`bg-purple-600 p-3 rounded-md font-medium text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </main>
    );
};

export default EditPost;
