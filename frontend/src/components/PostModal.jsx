import { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaRegHeart, FaEllipsisV, FaEdit, FaTrashAlt } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const PostModal = ({ postId, onClose }) => {
    const [post, setPost] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [commentText, setCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [hasLiked, setHasLiked] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    const userRole = localStorage.getItem('role') || sessionStorage.getItem('role');

    useEffect(() => {
        const fetchPost = async () => {
            if (!token) {
                console.error("Usuario no autenticado");
                return;
            }
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/posts/${postId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                console.log(response.data)
                setPost(response.data);
                setIsOwner(response.data.author._id === userId);
                setHasLiked(response.data.likes.includes(userId));

                // Verificar si el usuario sigue al autor
                const followingResponse = await axios.get(
                    `${import.meta.env.VITE_API_URL}/profile/${response.data.author._id}/followers`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setIsFollowing(followingResponse.data.some(follower => follower._id === userId));
            } catch (error) {
                console.error("Error al obtener la publicación:", error);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId, token, userId]);

    const handleClose = () => {
        onClose();
    };

    const handleAddComment = async () => {
        if (!token || !commentText.trim()) return;
        setIsSubmitting(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/posts/${postId}/comment`,
                { content: commentText },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const newComment = response.data.comment;
            setPost(prevPost => ({
                ...prevPost,
                comments: [...prevPost.comments, newComment]
            }));
            setCommentText("");
        } catch (error) {
            console.error("Error al agregar el comentario:", error);
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleEditComment = async (commentId, newContent) => {
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/comments/${commentId}`,
                { content: newContent },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPost(prevPost => ({
                ...prevPost,
                comments: prevPost.comments.map(comment =>
                    comment._id === commentId
                        ? { ...comment, content: response.data.comment.content, updatedAt: response.data.comment.updatedAt }
                        : comment
                )
            }));
            setIsEditing(null);
        } catch (error) {
            console.error("Error al editar el comentario:", error);
        }
    };


    const handleToggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleToggleLike = async () => {

        if (!token) return;

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/posts/${postId}/toggleLike`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setHasLiked(!hasLiked);
            setPost((prevPost) => ({
                ...prevPost,
                likes: hasLiked
                    ? prevPost.likes.filter((id) => id !== localStorage.getItem('userId')) || sessionStorage.getItem('userId')
                    : [...prevPost.likes, localStorage.getItem('userId') || sessionStorage.getItem('userId')],
            }));
        } catch (error) {
            console.error("Error al dar like:", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPost(prevPost => ({
                ...prevPost,
                comments: prevPost.comments.filter(comment => comment._id !== commentId)
            }));
        } catch (error) {
            console.error("Error al eliminar el comentario:", error);
        }
    };

    const handleToggleFollow = async () => {
        try {

            const userId = post.author._id;
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/profile/${userId}/toggleFollow`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsFollowing(!isFollowing);
            alert(response.data.msg);
        } catch (error) {
            console.error("Error al seguir/dejar de seguir al usuario:", error);
        }
    };

    const handleReportPost = async () => {
        const reason = prompt("Indica la razón para reportar el post (máx. 500 caracteres):");
        if (!reason || reason.length > 500) {
            return alert("Razón inválida. Debe tener menos de 500 caracteres.");
        }

        try {

            await axios.post(
                `${import.meta.env.VITE_API_URL}/posts/${postId}/report`,
                { reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Post reportado exitosamente.");
        } catch (error) {
            console.error("Error al reportar el post:", error);
        }
    };

    const handleDeletePost = async () => {
        if (!token) {
            console.log("Debes estar autenticado para eliminar esta publicación.");
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
            console.log("No se pudo eliminar la publicación. Inténtalo de nuevo.");
        }
    };


    if (!post) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            onClick={handleClose}
        >
            <div
                className="bg-gray-900 flex w-full max-w-5xl rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image container and navigation */}
                <div className="relative flex-2 bg-black flex items-center justify-center max-w-[70%]">
                    {post.media.length > 1 && currentImageIndex > 0 && (
                        <button
                            onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                        >
                            <IoIosArrowBack size={24} />
                        </button>
                    )}
                    <img
                        src={post.media[currentImageIndex].secure_url}
                        alt={`Post Media ${currentImageIndex + 1}`}
                        className="object-contain max-h-screen"
                    />
                    {post.media.length > 1 && currentImageIndex < post.media.length - 1 && (
                        <button
                            onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                        >
                            <IoIosArrowForward size={24} />
                        </button>
                    )}
                </div>

                {/* Right side details section */}
                <div className="w-80 bg-gray-900 flex flex-col text-white relative">
                    {/* Header with options menu */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <div className="flex items-center">
                            <img
                                src={post.author.profilePicture?.secure_url || '/default-avatar.png'}
                                alt="Profile"
                                className="w-10 h-10 rounded-full mr-3"
                            />
                            <span className="font-semibold">{post.author.username}</span>
                        </div>
                        <div className="relative">
                            <button onClick={handleToggleMenu} className="text-white text-xl">
                                <FaEllipsisV />
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 top-8 bg-gray-800 text-sm rounded shadow-lg py-2 w-40">
                                    {isOwner || userRole == "admin" ? (
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
                                            <button onClick={handleToggleFollow} className="block w-full text-left px-4 py-2 hover:bg-gray-700">
                                                {isFollowing ? "Dejar de Seguir" : "Seguir"}
                                            </button>
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

                    {/* Post content */}
                    <div className="p-4">
                        <p>
                            <span className="font-semibold">{post.author.username}</span> {post.content}
                        </p>
                        <span className="text-gray-400 text-xs mt-1">Hace 2 horas</span>
                    </div>

                    {/* Comments list */}
                    <div className="flex-1 overflow-y-auto border-t border-gray-700 p-4 space-y-4 max-h-96">
                        {post.comments.map((comment) => (
                            <div key={comment._id} className="flex items-start space-x-3">
                                <img src={comment.author.profilePicture?.secure_url || '/default-avatar.png'} alt="Commenter" className="w-8 h-8 rounded-full" />
                                <div className="w-64 break-words overflow-x-hidden">
                                    <div className="flex items-center">
                                        <span className="font-semibold mr-2">{comment.author.username}</span>
                                        <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
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
                                            {comment.updatedAt && new Date(comment.updatedAt) > new Date(comment.createdAt) && (
                                                <span className="text-xs text-gray-400 ml-2">(Editado)</span>
                                            )}
                                        </p>
                                    )}
                                    {(comment.author._id === userId || post.author._id === userId || userRole === "admin") && (
                                        <div className="flex space-x-2 mt-1">
                                            {comment.author._id === userId && (
                                                <FaEdit className="text-gray-400 hover:text-blue-500 cursor-pointer" onClick={() => setIsEditing(isEditing === comment._id ? null : comment._id)} />
                                            )}
                                            <FaTrashAlt className="text-gray-400 hover:text-red-500 cursor-pointer" onClick={() => handleDeleteComment(comment._id)} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>


                    {/* Action icons and comment area */}
                    <div className="p-4 border-t border-gray-700">
                        <div className="flex justify-between mb-3">
                            <div className="flex space-x-4">
                                <FaRegHeart
                                    onClick={handleToggleLike}
                                    className={`text-2xl cursor-pointer ${hasLiked ? "text-red-500" : "hover:text-gray-400"}`}
                                />

                            </div>
                        </div>

                        <div className="flex items-center border-t border-gray-700 pt-4 mt-4">
                            <input
                                type="text"
                                placeholder="Añade un comentario..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
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
            </div>
        </div>
    );
};

PostModal.propTypes = {
    postId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default PostModal;
