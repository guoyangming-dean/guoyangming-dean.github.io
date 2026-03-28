# Auto-frontmatter plugin for Jekyll collections
# Injects default frontmatter into markdown files that lack it
# GitHub Pages compatible (plugins in _plugins/ are supported)
#
# This plugin detects collection documents without frontmatter (empty data hash)
# and assigns default layout and extracts title from the first H1 heading.

Jekyll::Hooks.register :documents, :post_read do |doc|
  # Only process the 'md' collection
  return unless doc.collection.label == 'md'

  # Check if document lacks frontmatter (data hash is empty)
  # Documents without frontmatter have content that starts with markdown, not ---
  if doc.data.empty? && doc.content.present?
    # Extract title from first H1 heading if present
    title = doc.path.split('/').last.gsub('.md', '').gsub('_', ' ')
    if doc.content =~ /^#\s+(.+)$/
      title = $1.strip
    end

    # Assign default frontmatter data (in-memory, no file modification)
    doc.data['layout'] = 'single'
    doc.data['title'] = title
  end
end