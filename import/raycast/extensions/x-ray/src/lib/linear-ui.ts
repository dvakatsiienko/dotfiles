import { Color, Icon, Image } from '@raycast/api';
import { getAvatarIcon } from '@raycast/utils';
import * as emoji from 'node-emoji';

import type { LinearState, LinearUser } from './linear';

const stateIcon: Record<string, Icon> = {
    backlog: Icon.CircleEllipsis,
    canceled: Icon.XMarkCircle,
    completed: Icon.CheckCircle,
    started: Icon.CircleProgress50,
    triage: Icon.QuestionMarkCircle,
    unstarted: Icon.Circle,
};

const priorityGlyph: Record<number, PriorityGlyph> = {
    1: { icon: Icon.ExclamationMark, name: 'urgent', tint: Color.Red },
    2: { icon: Icon.ArrowUp, name: 'high', tint: Color.Orange },
    3: { icon: Icon.Minus, name: 'medium', tint: Color.Yellow },
    4: { icon: Icon.ArrowDown, name: 'low', tint: Color.SecondaryText },
};

// Shape carries the category, tint carries the colour the workspace picked for that exact
// state. `adjustContrast` is what keeps a pale workspace colour readable on a dark theme.
export const toStateIcon = (state: LinearState): Image.ImageLike => ({
    source: stateIcon[state.type] ?? Icon.Circle,
    tintColor: { adjustContrast: true, dark: state.color, light: state.color },
});

// Priority 0 is "no priority", which most of the board is. It still needs a glyph here
// because this one leads the row: a row with no icon would sit shifted against its neighbours.
export const toPriorityIcon = (priority: number): Image.ImageLike => {
    const glyph = priorityGlyph[priority];

    return glyph
        ? { source: glyph.icon, tintColor: glyph.tint }
        : { source: Icon.Dot, tintColor: Color.SecondaryText };
};

export const toPriorityName = (priority: number) =>
    priorityGlyph[priority]?.name ?? 'none';

// An avatar url when linear has one, initials when it does not, and a plain person glyph
// for nobody — so the column holds its width whether or not anyone is assigned.
export const toUserIcon = (user: LinearUser | null): Image.ImageLike => {
    if (!user) return Icon.Person;

    return {
        mask: Image.Mask.Circle,
        source: user.avatarUrl
            ? encodeURI(user.avatarUrl)
            : getAvatarIcon(user.displayName.toUpperCase()),
    };
};

// Linear stores a project icon as an emoji shortcode (`:package:`), never as the character.
// Anything it does not resolve falls back to a folder tinted with the project's own colour,
// so a project linear invents an icon for still reads as a project.
export const toProjectIcon = (project: ProjectLook): Image.ImageLike => {
    const glyph = project.icon ? emoji.get(project.icon) : undefined;

    if (glyph) return glyph;

    return {
        source: Icon.Folder,
        tintColor: project.color ?? Color.SecondaryText,
    };
};

/* Types */
interface PriorityGlyph {
    icon: Icon;
    name: string;
    tint: Color;
}

interface ProjectLook {
    color: string | null;
    icon: string | null;
}
