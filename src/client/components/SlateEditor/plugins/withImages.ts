import { Transforms, BaseElement } from 'slate';
import imageExtensions from 'image-extensions';
import isUrl from 'is-url';
import { CustomEditor } from '../../../types/SlateEditor/types';

type ImageElement = {
    type: 'image';
    url: string;
    children: TextElement[];
};

type TextElement = {
    type?: 'text';
    text: string;
};

export const insertImage = (editor: CustomEditor, url: string) => {
    const text = { text: '' }
    const image: ImageElement = { type: 'image', url, children: [text] }
    Transforms.insertNodes(editor, image)
    Transforms.insertNodes(editor, {
        type: 'paragraph',
        children: [{ text: '' }],
    })
}

export const isImageUrl = (url: string) => {
    if (!url) return false
    if (!isUrl(url)) return false
    const ext = new URL(url).pathname.split('.').pop()
    return imageExtensions.includes(ext)
}

export const withImages = (editor: CustomEditor) => {
    const { insertData, isVoid } = editor

    editor.isVoid = (element: BaseElement) => {
        return element.type === 'image' ? true : isVoid(element)
    }

    editor.insertData = (data: DataTransfer) => {
        const text = data.getData('text/plain')
        const { files } = data

        if (files && files.length > 0) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                const [mime] = file.type.split("/");

                if (mime === "image") {
                    reader.addEventListener("load", () => {
                        const url = reader.result as string;
                        insertImage(editor, url);
                    });

                    reader.readAsDataURL(file);
                }
            });
        } else if (isImageUrl(text)) {
            insertImage(editor, text)
        } else {
            insertData(data)
        }
    }

    return editor
}