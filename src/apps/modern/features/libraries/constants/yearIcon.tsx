import createSvgIcon from '@mui/material/utils/createSvgIcon';

// Six small calendars arranged 3 across, 2 tall — the "individual years" glyph, distinct from the
// single-calendar Decades tile.
const CELLS: ReadonlyArray<readonly [number, number]> = [
    [2, 2], [9, 2], [16, 2],
    [2, 11], [9, 11], [16, 11]
];

const YearIcon = createSvgIcon(
    <g>
        {CELLS.map(([x, y]) => (
            <g key={`${x}-${y}`}>
                <rect
                    x={x}
                    y={y}
                    width='5.2'
                    height='6.4'
                    rx='1.2'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.2'
                />
                <path
                    d={`M ${x} ${y + 1.7} H ${x + 5.2}`}
                    stroke='currentColor'
                    strokeWidth='1.2'
                />
            </g>
        ))}
    </g>,
    'YearIcon'
);

export default YearIcon;
