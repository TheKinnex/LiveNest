import { Link, useNavigate } from 'react-router-dom';
import { FaComments } from 'react-icons/fa';
import LogoTipo from '../assets/Proyecto Nuevo.png'
const HeaderMobile = () => {
    const navigate = useNavigate();

    return (
        <header className="lg:hidden fixed top-0 w-full bg-[#1f2937] text-white py-3 flex items-center justify-between px-4 z-20 shadow">
            <Link to={'/'}> <img src={LogoTipo} className='w-28' /> </Link>
            <button
                onClick={() => navigate('/conversations')}
                className="text-white text-xl focus:outline-none"
                aria-label="Ir a Conversaciones"
            >
                <FaComments />
            </button>
        </header>
    );
};

export default HeaderMobile;
