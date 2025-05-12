import * as CommitRepository from "../repository/commit.js";
export default class RepoService {
    static async getCommits() {
        return CommitRepository.getAllCommits();
    }

    static async getCommitsCount() {
        return CommitRepository.count();
    }
}
