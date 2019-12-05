import * as core from "@actions/core";
import { ISettings, Action } from "./action";

async function run() {
    let settings: ISettings = {
        workingPath: core.getInput("workingPath", { required: true }),
        dockerFile: core.getInput("dockerFile", { required: true }),
        dockerRegistery: core.getInput("dockerRegistery", { required: true }),
        dockerUserName: core.getInput("dockerUserName", { required: true }),
        dockerPassword: core.getInput("dockerPassword", { required: true }),
        dockerImageName: core.getInput("dockerImageName", { required: true }),
        dockerTags: core.getInput("dockerTags", { required: true }).split(","),
    };

    let action = new Action(settings);
    await action.run();
}

run().catch(core.setFailed);
