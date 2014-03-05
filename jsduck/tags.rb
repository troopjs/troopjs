require "jsduck/tag/tag"
require "jsduck/tag/boolean_tag"

# See https://github.com/senchalabs/jsduck/wiki/Custom-tags

module JsDuck::Tag
	class License < Ignore
		def initialize
			@tagname = :ignore
			@pattern = "license"
		end
	end
end
