export function getMeta({ currentPage, total, pageSize }) {
    const totalPage = Math.ceil(total / pageSize);
    const nextPage = currentPage + 1 > totalPage ? totalPage : currentPage + 1;
    return {
        currentPage,
        nextPage,
        total,
        pageSize,
        totalPage,
    };
}
