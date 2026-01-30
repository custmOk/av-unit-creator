import React from 'react';

const TAG_REGEX = /\[(#[0-9a-fA-F]{6}|[a-zA-Z]+)\|(.+?)\]/g;

const NUMBER_REGEX = /(-?\+?\d+(?:\.\d+)?%?)/g;

export const RichTextParser: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;

    // We split the string by the regex.
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    // Iterate through all matches
    while ((match = TAG_REGEX.exec(text)) !== null) {
        const [fullMatch, color, content] = match;
        const startIndex = match.index;

        // 1. Push the normal text occurring before this tag
        if (startIndex > lastIndex) {
            const normalText = text.substring(lastIndex, startIndex);
            parts.push(
                <NumberParser key={`text-${lastIndex}`} text={normalText} />
            );
        }

        // 2. Push the colored segment
        parts.push(
            <span
                key={`tag-${startIndex}`}
                style={{ color: color }}
                className="font-bold drop-shadow-sm filter brightness-110"
            >
                <NumberParser text={content} />
            </span>
        );

        lastIndex = startIndex + fullMatch.length;
    }
    // 3. Push any remaining text after the last tag
    if (lastIndex < text.length) {
        const remainingText = text.substring(lastIndex);
        parts.push(<NumberParser key={`text-end`} text={remainingText} />);
    }

    return <>{parts}</>;
};

// --- SUB-COMPONENT: Parses Numbers within "Normal" text ---
const NumberParser: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(NUMBER_REGEX);

    return (
        <>
            {parts.map((part, i) => {
                // If the part matches a number/percent, color it Cyan
                if (NUMBER_REGEX.test(part)) {
                    return (
                        <span
                            key={i}
                            className="text-cyan-400 font-mono font-bold"
                        >
                            {part}
                        </span>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </>
    );
};
