Agent Skills with Anthropic

[Agent Skills with Anthropic](https://www.bilibili.com/video/BV1qv6eBZErD/?vd_source=ffe27f664a389c93f783f37e506048ab)

Andrew: Skills是说明文件夹，扩展您的Agent能力，使其具有专业知识。

Andrew：

1. 任何skill都应该包含一个skill.md markdown文件（包含skill的name，description，instructions）。main instructions可以参考其他文件，比如脚本，模板和图像等assets
2. skills逐步向Agent透露，这一位这skill的name和description始终 live inAgent的上下文窗口中，但是Agent不加载其他instructions，直到有用户请求与skill描述匹配。之后，如果需要的话，Agent可能会额外加载reference和asset files 

Eddie：你的智能体可以将skills与MCP及子智能体结合，以创建强大的Agent工作流：

1. 使用MCP从外部来源获取数据
2. 依靠skills来知道如何处理这些数据，或如何高效地检索它
3. 将任务委派给一个具体独立上下文的sub-agent，该sub-agent也可以使用skills来获取专业知识

