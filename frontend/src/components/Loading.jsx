import { FaSpinner } from 'react-icons/fa';

const Loading = () => {
    return (
    <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-purple-600" />
    </div>
    );
}

export default Loading;