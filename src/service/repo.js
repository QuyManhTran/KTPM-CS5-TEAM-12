import * as RepoRepository from "../repository/repo.js";
export default class RepoService {
    static async getRepo() {
        return RepoRepository.findAll();
    }
}
