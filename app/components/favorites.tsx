import { useFetcher } from "@remix-run/react";
import { FC } from "react";
import { ContactRecord } from "~/data";

interface FavoriteProps {
    contact: Pick<ContactRecord, 'id' | 'favorite'>;
}

const Favorite: FC<FavoriteProps> = ({ contact }) => {
    const fetcher = useFetcher();
    const favorite = fetcher.formData
        ? fetcher.formData.get('favorite') === 'true'
        : contact.favorite;
        
    return (
        <fetcher.Form method="post">
            <input type="hidden" name="contactId" value={contact.id} />
            <button
                aria-label={
                    favorite ? 'Remove from favorites' : 'Add to favorites'
                }
                name="favorite"
                value={favorite ? 'false' : 'true'}
            >
                {favorite ? '★' : '☆'}
            </button>
        </fetcher.Form>
    );
};

export default Favorite;