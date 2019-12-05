"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const action_1 = require("./action");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let settings = {
            workingPath: core.getInput("workingPath", { required: true }),
            dockerFile: core.getInput("dockerFile", { required: true }),
            dockerRegistery: core.getInput("dockerRegistery", { required: true }),
            dockerUserName: core.getInput("dockerUserName", { required: true }),
            dockerPassword: core.getInput("dockerPassword", { required: true }),
            dockerImageName: core.getInput("dockerImageName", { required: true }),
            dockerTags: core.getInput("dockerTags", { required: true }).split(","),
        };
        let action = new action_1.Action(settings);
        yield action.run();
    });
}
run().catch(core.setFailed);
