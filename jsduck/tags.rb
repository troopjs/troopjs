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

    # Fixed constructor method display.
    class Method
      def to_html(m, cls)
        method_link(m, cls) + member_params(m[:params]) + return_value(m)
      end

      def method_link(m, cls)
        if constructor?(m)
          member_link(:owner => m[:owner], :id => "m[:id]", :name => ClassName.short(cls[:name]))
        else
          member_link(m)
        end
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

  module Render
    # Fixed member link anchor.
    class SignatureUtil
      def self.link(class_name, member_id, text)
        member_id.gsub!(/\//,'-')
        "<a href='#!/api/#{class_name}-#{member_id}' class='name expandable'>#{text}</a>"
      end
    end
  end

  module Inline
    # Fixed member link anchor.
    class LinkRenderer
      # Generates HTML link to class or member applying the link
      # template.
      def link(cls, member, anchor_text, type=nil, static=nil)
        # Use the canonical class name for link (not some alternateClassName)
        cls = @relations[cls][:name]
        # prepend type name to member name
        member = member && get_matching_member(cls, {:name => member, :tagname => type, :static => static})
        member_id = member && member[:id].gsub(/\//,'-')
        @tpl.gsub(/(%[\w#-])/) do
          case $1
          when '%c'
            cls
          when '%m'
            member ?  member_id : ""
          when '%#'
            member ? "#" : ""
          when '%-'
            member ? "-" : ""
          when '%a'
            Util::HTML.escape(anchor_text||"")
          else
            $1
          end
        end
      end
    end
  end

  module Doc
    class Scanner
      alias_method :old_initialize, :initialize
      def initialize
        old_initialize
        # Fixed scanner that allows for slash in identifier.
        @ident_pattern = /[\w$-_\/]+/
        # Fixed argument plates.
        @ident_chain_pattern = /[$\w-]+(?:(?:\.{3})|(\.[$\w-]+)*)/
      end
    end

    # Fixed argument splats.
    class Subproperties
      def nest(raw_items, pos)
        # First item can't be namespaced, if it is ignore the rest.
        if raw_items[0] && raw_items[0][:name] =~ /[^.]\.[^.]/
          warn(raw_items[0][:name], pos)
          raw_items[0][:name].sub!(/\..*$/, '')
          return [raw_items[0]]
        end

        # build name-index of all items
        index = {}
        raw_items.each {|it| index[it[:name]] = it }

        # If item name has no dots, add it directly to items array.
        # Otherwise look up the parent of item and add it as the
        # property of that parent.
        items = []
        raw_items.each do |it|
          if it[:name] =~ /^(.+)\.([^.]+)$/
            it[:name] = $2
            parent = index[$1]
            if parent
              parent[:properties] = [] unless parent[:properties]
              parent[:properties] << it
            else
              warn("#{$1}.#{$2}", pos)
            end
          else
            items << it
          end
        end

        return items
      end
    end
  end
end
