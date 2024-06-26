import { json, redirect } from '@remix-run/node';
import type {
    ActionFunctionArgs,
    LinksFunction,
    LoaderFunctionArgs,
} from '@remix-run/node';
import {
    Form,
    Links,
    Meta,
    NavLink,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
    useNavigation,
    useSubmit,
} from '@remix-run/react';
import appStylesHref from './app.css?url';
import { createEmptyContact, getContacts, updateContact } from './data';
import { useEffect } from 'react';
import Favorite from './components/favorites';
import invariant from 'tiny-invariant';

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const contactId = formData.get('contactId')?.toString();
    const favorite = formData.get('favorite');

    // hacking to allow updating favorite from sidenav
    if (favorite) {
        invariant(contactId, 'Missing contactId param');
        return updateContact(contactId, {
            favorite: favorite === 'true',
        });
    } else {
        const contact = await createEmptyContact();
        return redirect(`/contacts/${contact.id}/edit`);
    }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const contacts = await getContacts(q);
    return json({ contacts, q });
};

export const links: LinksFunction = () => [
    { rel: 'stylesheet', href: appStylesHref },
];

export default function App() {
    const { contacts, q } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const submit = useSubmit();
    const searching =
        navigation.location &&
        new URLSearchParams(navigation.location.search).has('q');
    useEffect(() => {
        const searchField = document.getElementById('q');
        if (searchField instanceof HTMLInputElement) {
            searchField.value = q || '';
        }
    }, [q]);
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body>
                <div id="sidebar">
                    <h1>Remix Contacts</h1>
                    <div>
                        <Form
                            id="search-form"
                            role="search"
                            onChange={(event) => {
                                const isFirstSearch = q === null;
                                submit(event.currentTarget, {
                                    replace: !isFirstSearch,
                                });
                            }}
                        >
                            <input
                                id="q"
                                className={searching ? 'loading' : ''}
                                defaultValue={q || ''}
                                aria-label="Search contacts"
                                placeholder="Search"
                                type="search"
                                name="q"
                            />
                            <div
                                id="search-spinner"
                                aria-hidden
                                hidden={true}
                            />
                        </Form>
                        <Form method="post">
                            <button type="submit">New</button>
                        </Form>
                    </div>
                    <nav>
                        {contacts.length ? (
                            <ul>
                                {contacts.map((contact) => (
                                    <li key={contact.id}>
                                        <div style={{}}>
                                        <NavLink
                                            className={({
                                                isActive,
                                                isPending,
                                            }) =>
                                                isActive
                                                    ? 'active'
                                                    : isPending
                                                    ? 'pending'
                                                    : ''
                                            }
                                            to={`contacts/${contact.id}`}
                                        >
                                            {contact.first || contact.last ? (
                                                <>
                                                    {contact.first}{' '}
                                                    {contact.last}
                                                </>
                                            ) : (
                                                <i>No Name</i>
                                            )}{' '}
                                        </NavLink>
                                        <Favorite contact={contact} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>
                                <i>No contacts</i>
                            </p>
                        )}
                    </nav>
                </div>
                <div
                    className={
                        navigation.state === 'loading' && !searching
                            ? 'loading'
                            : ''
                    }
                    id="detail"
                >
                    <Outlet />
                </div>

                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}
