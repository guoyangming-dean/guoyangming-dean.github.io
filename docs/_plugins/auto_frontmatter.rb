# Auto-frontmatter plugin for Jekyll md collection
# Sets default layout and title from filename/heading
Jekyll::Hooks.register :documents, :pre_render do |doc, payload|
  next unless doc.collection.label == 'md'
  if doc.data['layout'].nil?
    doc.data['layout'] = 'single'
  end
  if doc.data['title'].nil? || doc.data['title'] == ''
    title = doc.path.split('/').last.gsub('.md', '').gsub('_', ' ')
    if doc.content =~ /^#\s+(.+)$/
      title = $1.strip
    end
    doc.data['title'] = title
  end
end
