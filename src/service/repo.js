import * as RepoRepository from "../repository/repo.js";
export default class RepoService {
    static async getRepo(pagination) {
        const repos = await RepoRepository.findAll(pagination);
        const count = await RepoRepository.count();
        const meta = {
            total: count,
            currentPage: pagination.page,
            pageSize: pagination.limit,
            totalPage: Math.ceil(count / pagination.limit),
            hasNextPage: pagination.page < Math.ceil(count / pagination.limit),
            hasPrevPage: pagination.page > 1,
        };
        return {
            data: repos,
            meta,
        };
    }
}
