require "jsduck/tag/tag"
require "jsduck/tag/boolean_tag"

# See https://github.com/senchalabs/jsduck/wiki/Custom-tags

module JsDuck

	module Tag
		class License < Ignore
			def initialize
				@tagname = :ignore
				@pattern = "license"
			end
		end

		# Fix event tag not to have a method-alike signature.
		class Event
			def to_html(event, cls)
			  member_link(event)
			end
		end

		# Introduce "handler" as a separate class member.
		class Handler < MemberTag
			def initialize
				@pattern = "handler"
				@tagname = :handler
				@member_type = {
					:title => "Handlers",
					:position => MEMBER_POS_METHOD + 0.1,
					:icon => File.dirname(__FILE__) + "/icons/handler.png"
				}
			end

			# @event name ...
			def parse_doc(p, pos)
			  {
				:tagname => :handler,
				:name => p.ident,
			  }
			end

			def process_doc(h, tags, pos)
			  h[:name] = tags[0][:name]
			end

			def merge(h, docs, code)
			  JsDuck::ParamsMerger.merge(h, docs, code)
			end

			def to_html(event, cls)
			  member_link(event) + member_params(event[:params])
			end
		end
	end

	module Doc
		# Fixed scanner that allows for slash in identifier.
		class Scanner
			alias_method :old_initialize, :initialize
			def initialize
				old_initialize
				@ident_pattern = /[\w$-_\/]+/
			end
		end
	end
end
