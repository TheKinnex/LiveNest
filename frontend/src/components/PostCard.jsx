/* eslint-disable react/prop-types */
import { FaHeart, FaRegHeart, FaComment, FaTimes, FaTrashAlt, FaEdit, FaEllipsisV } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
    const userRole = localStorage.getItem("role") || sessionStorage.getItem("role");

    const [likes, setLikes] = useState(post.likes.length || 0);
    const [liked, setLiked] = useState(post.likes.some(like => typeof like === 'string' ? like === userId : like._id === userId));
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const touchStartRef = useRef(null);

    useEffect(() => {
        setComments(post.comments.filter(comment => !comment.isDelete));
    }, [post.comments]);

    const handleToggleLike = async () => {
        if (!token) {
            setErrorMsg("Debes estar autenticado para dar like.");
            return;
        }

        const previousLiked = liked;
        const previousLikes = likes;

        setLiked(!liked);
        setLikes(liked ? likes - 1 : likes + 1);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/posts/${post._id}/toggleLike`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updatedLikes = response.data.post.likes;
            setLikes(updatedLikes.length);
            setLiked(updatedLikes.includes(userId));
            setErrorMsg("");
        } catch (error) {
            console.error("Error al dar like:", error.response?.data?.msg || error.message);
            setErrorMsg(error.response?.data?.msg || "Error al dar like.");
            setLiked(previousLiked);
            setLikes(previousLikes);
        }
    };

    const handleAddComment = async () => {
        if (!token || !commentText.trim()) {
            setErrorMsg("El comentario no puede estar vacío.");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/posts/${post._id}/comment`,
                { content: commentText },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const newComment = response.data.comment;
            setComments(prevComments => [...prevComments, newComment]);
            setCommentText("");
        } catch (error) {
            console.error("Error al agregar el comentario:", error.response?.data?.msg || error.message);
            setErrorMsg(error.response?.data?.msg || "Error al agregar el comentario.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setComments(prevComments => prevComments.map(comment =>
                comment._id === commentId ? { ...comment, isDelete: true } : comment
            ));
        } catch (error) {
            console.error("Error al eliminar el comentario:", error);
        }
    };

    const handleEditComment = async (commentId, newContent) => {
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/comments/${commentId}`,
                { content: newContent },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComments(prevComments => prevComments.map(comment =>
                comment._id === commentId ? { ...comment, content: response.data.comment.content, updatedAt: response.data.comment.updatedAt } : comment
            ));
            setIsEditing(null);
        } catch (error) {
            console.error("Error al editar el comentario:", error);
        }
    };

    const handleDeletePost = async () => {
        if (!token) {
            setErrorMsg("Debes estar autenticado para eliminar esta publicación.");
            return;
        }
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/posts/${post._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Publicación eliminada correctamente.");
            window.location.reload(); // Recargar la página para reflejar los cambios
        } catch (error) {
            console.error("Error al eliminar la publicación:", error);
            setErrorMsg("No se pudo eliminar la publicación. Inténtalo de nuevo.");
        }
    };


    const handleReportPost = async () => {
        const reason = prompt("Indica la razón para reportar el post (máx. 500 caracteres):");
        if (!reason || reason.length > 500) {
            return alert("Razón inválida. Debe tener menos de 500 caracteres.");
        }

        try {

            await axios.post(
                `${import.meta.env.VITE_API_URL}/posts/${post._id}/report`,
                { reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Post reportado exitosamente.");
        } catch (error) {
            console.error("Error al reportar el post:", error);
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const handleToggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleSwipe = (direction) => {
        if (direction === "left") {
            setCurrentImageIndex(prevIndex => prevIndex < post.media.length - 1 ? prevIndex + 1 : 0);
        } else if (direction === "right") {
            setCurrentImageIndex(prevIndex => prevIndex > 0 ? prevIndex - 1 : post.media.length - 1);
        }
    };

    const onTouchStart = (e) => {
        touchStartRef.current = e.changedTouches[0].clientX;
    };

    const onTouchEnd = (e) => {
        const touchEnd = e.changedTouches[0].clientX;
        if (touchStartRef.current - touchEnd > 50) handleSwipe("left");
        if (touchStartRef.current - touchEnd < -50) handleSwipe("right");
    };

    const isCommentEdited = (comment) => {
        if (!comment.updatedAt || !comment.createdAt) return false;
        const created = new Date(comment.createdAt).getTime();
        const updated = new Date(comment.updatedAt).getTime();
        return (updated - created) > 1000; // Más de 1 segundo de diferencia
    };

    return (
        <div className="rounded-lg overflow-hidden">
            <div className="p-2">
                <div className="flex justify-between">
                    <div>
                        <Link className="flex items-center" to={`/profile/${post.author.username}`}>
                            <img
                                src={post.author.profilePicture?.secure_url || '/default-avatar.png'}
                                alt="Profile"
                                className="w-9 h-w-9 rounded-full mr-3"
                            />
                            <span className="font-semibold text-sm">{post.author.username}</span>
                        </Link>
                    </div>
                    <button onClick={handleToggleMenu} className="text-gray-400">
                        <FaEllipsisV />
                    </button>
                </div>
                <div className="relative">
                    {isMenuOpen && (
                        <div className="absolute right-0 top-0 bg-gray-800 text-sm rounded shadow-lg py-2 w-40 z-10">
                            {post.author._id === userId || userRole === "admin" ? (
                                <>
                                    <Link to={`/posts/${post._id}/edit`} className='block w-full text-left px-4 py-2 hover:bg-gray-700'>
                                        Editar Post
                                    </Link>
                                    <button onClick={handleDeletePost} className="block w-full text-left px-4 py-2 hover:bg-gray-700">
                                        Eliminar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleReportPost} className="block w-full text-left px-4 py-2 hover:bg-gray-700">
                                        Denunciar
                                    </button>
                                </>
                            )}
                            <button onClick={handleToggleMenu} className="block w-full text-left px-4 py-2 hover:bg-gray-700">
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Carrusel de Imágenes */}
            <div className="relative">
                {post.media.length > 0 && (
                    <>
                        {post.media[currentImageIndex].type === "video" ? (
                            <video
                                src={post.media[currentImageIndex].secure_url}
                                controls
                                className="w-full h-[25rem]  object-cover"
                                onTouchStart={onTouchStart}
                                onTouchEnd={onTouchEnd}
                            />
                        ) : (
                            <img
                                src={post.media[currentImageIndex].secure_url}
                                alt={`Post Media ${currentImageIndex + 1}`}
                                className="w-full h-[25rem] md:h-[35rem] object-contain"
                                onTouchStart={onTouchStart}
                                onTouchEnd={onTouchEnd}
                            />
                        )}
                    </>
                )}

                {/* Puntos del Carrusel */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {post.media.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-gray-500"}`}
                        />
                    ))}
                </div>
            </div>

            {/* Detalles del Post */}
            <div className="p-4">
                {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}

                {/* Botones de Like y Comentarios */}
                <div className="flex items-center space-x-4">
                    <button onClick={handleToggleLike} className="flex items-center space-x-1">
                        {liked ? (
                            <FaHeart className="text-red-500" />
                        ) : (
                            <FaRegHeart className="text-gray-400" />
                        )}
                        <span>{likes}</span>
                    </button>
                    <button onClick={openModal} className="flex items-center space-x-1">
                        <FaComment className="text-gray-400" />
                        <span>{comments.filter(comment => !comment.isDelete).length}</span>
                    </button>
                </div>

                <div className="flex flex-col mt-2">
                    <span className="text-sm">
                        <span className="font-semibold">{post.author.username}</span> {post.content}
                    </span>
                    <span onClick={openModal} className="text-xs text-gray-500 cursor-pointer">
                        Ver todos los comentarios
                    </span>
                    {/* Mostrar los dos primeros comentarios */}
                    {comments.slice(0, 2).map((comment) => (
                        <div key={comment._id} className="text-sm mt-1">
                            <span className="font-semibold">{comment.author.username}:</span> {comment.content}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de Comentarios */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end items-end z-50">
                    <div className="bg-gray-800 p-4 rounded-t-lg w-full max-w-xl h-3/4 flex flex-col md:absolute md:right-28">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Comentarios</h3>
                            <button onClick={closeModal} className="text-white">
                                <FaTimes />
                            </button>
                        </div>
                        <hr className="border-t border-gray-100 " />
                        <div className="flex-1 overflow-y-auto overflow-x-hidden mb-4">
                            {comments.filter(comment => !comment.isDelete).length > 0 ? (
                                comments.filter(comment => !comment.isDelete).map((comment) => (
                                    <div key={comment._id} className="flex items-start space-x-2 mb-2">
                                        <img
                                            src={comment.author.profilePicture?.secure_url || '/default-avatar.png'}
                                            alt="Commenter"
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <div className="flex flex-col w-80 break-words">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-semibold text-sm">{comment.author.username}</span>
                                                    <p className="text-sm">
                                                        <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                                                    </p>
                                                </div>
                                                {(comment.author._id === userId || post.author._id === userId || userRole === "admin") && (
                                                    <div className="flex space-x-2">
                                                        {comment.author._id === userId && (
                                                            <FaEdit
                                                                className="text-gray-400 hover:text-blue-500 cursor-pointer"
                                                                onClick={() => setIsEditing(comment._id)}
                                                            />
                                                        )}
                                                        <FaTrashAlt
                                                            className="text-gray-400 hover:text-red-500 cursor-pointer"
                                                            onClick={() => handleDeleteComment(comment._id)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            {isEditing === comment._id ? (
                                                <input type="text" defaultValue={comment.content} className="p-2 mt-1 text-sm bg-gray-700 text-white rounded-md focus:outline-none"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleEditComment(comment._id, e.target.value);
                                                    }}
                                                />
                                            ) : (
                                                <p className="text-sm">
                                                    {comment.content}
                                                    {isCommentEdited(comment) && (
                                                        <span className="text-xs text-gray-400 ml-2">(Editado)</span>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No hay comentarios.</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 border-t border-gray-700 pt-4 mt-4">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Agregar un comentario..."
                                className="flex-1 p-2 bg-gray-700 text-white rounded-md focus:outline-none"
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={isSubmitting || !commentText.trim()}
                                className={`text-blue-500 font-semibold ml-2 ${isSubmitting || !commentText.trim() ? "opacity-50 cursor-not-allowed" : "hover:text-blue-400"}`}
                            >
                                {isSubmitting ? "Publicando..." : "Publicar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostCard;
