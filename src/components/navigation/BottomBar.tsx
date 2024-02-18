import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faCalendar, faHouse, faPlus, faTimeline } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BottomBar = () => {
  const pathname = usePathname();
  const linkStyle = (path: string | null) =>
    `inline-flex flex-col items-center justify-center gap-1 group ${pathname === path ? 'text-deep-green' : 'hover:text-deep-green text-deep-gray'}`;

  return (
    <div className="fixed w-full bg-white bottom-0 text-deep-gray font-light py-4 border-t">
      <div className="grid h-full grid-cols-5 mx-auto max-w-xl">
        <Link href="/" className={linkStyle('/')}>
          <FontAwesomeIcon icon={faHouse} />
          <span className="text-sm">Home</span>
        </Link>
        <Link href="/events" className={linkStyle('/events')}>
          <FontAwesomeIcon icon={faCalendar} />
          <span className="text-sm">Events</span>
        </Link>
        <div className="flex items-center justify-center">
          <Link
            href="/events/create"
            className="inline-flex items-center justify-center w-10 h-10 font-medium bg-deep-green rounded-full hover:bg-deep-gray text-bar-white"
          >
            <FontAwesomeIcon icon={faPlus} />
          </Link>
        </div>
        <Link href="/movies" className={linkStyle('/movies')}>
          <FontAwesomeIcon icon={faYoutube} />
          <span className="text-sm">Movies</span>
        </Link>
        <Link href="/events/history" className={linkStyle('/events/history')}>
          <FontAwesomeIcon icon={faTimeline} />
          <span className="text-sm">History</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomBar;
