import { getEventTags } from "@/lib/supabase/getEventTags";
import { useEffect, useState } from "react";
import type { TagType } from "@/types/tag";
import type { EventCardProps } from "../../types/event";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import {
  faCakeCandles,
  faHandshakeSimple,
  faPaw,
  faSun,
  faTicket,
} from "@fortawesome/free-solid-svg-icons";

const defaultImageUrl = "/event-placeholder.png";

const HistoryItem: React.FC<EventCardProps> = ({
  title,
  location,
  date,
  imageUrl,
  id,
  description,
}) => {
  const formattedDate = new Date(date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  //idに紐づくタグを取得する
  const [src, setSrc] = useState<IconDefinition>(faSun);

  useEffect(() => {
    fetchEventTags();
  }, []);

  const fetchEventTags = async () => {
    const tags = await getEventTags(id);
    filterIcon(tags); // tagsを引数として直接渡す
  };

  const filterIcon = (tags: TagType[]) => {
    let icon = faSun;
    const tagLabel = tags[0]?.label; // Assuming tags array is not empty

    switch (tagLabel) {
      case "単独":
        icon = faTicket;
        break;
      case "対バン":
        icon = faSun;
        break;
      case "リリイベ":
        icon = faHandshakeSimple;
        break;
      case "生誕":
        icon = faCakeCandles;
        break;
      default:
        icon = faPaw;
    }

    setSrc(icon);
  };

  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-white text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
        <FontAwesomeIcon icon={src} className="text-2xl text-deep-green" />
      </div>

      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-slate-200 shadow">
        <div className="flex items-center justify-between space-x-2 mb-1">
          <div className="font-bold text-slate-900">{title}</div>
          <time className="font-caveat font-medium text-deep-green">
            {formattedDate}
          </time>
        </div>
        <div className="text-slate-500">{description}</div>
      </div>
    </div>
  );
};

export default HistoryItem;
